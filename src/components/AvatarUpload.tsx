"use client";

import { Fallback, Image, Root } from "@radix-ui/react-avatar";
import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { PiSpinnerBold, PiUploadSimpleBold, PiXBold } from "react-icons/pi";
import { env } from "~/env";
import { useAvatarUpload } from "~/hooks/useAvatarUpload";
import FormButton from "./FormButton";

/**
 * Extracts the crop region from the rendered `<img>` element and
 * downscales to `size`×`size` WebP. Uses the rendered dimensions to
 * derive the scale factor back to natural pixel coordinates.
 */
async function exportCrop(
  imgEl: HTMLImageElement,
  pixelCrop: PixelCrop,
  size = 512,
): Promise<File> {
  const scaleX = imgEl.naturalWidth / imgEl.width;
  const scaleY = imgEl.naturalHeight / imgEl.height;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas.getContext("2d")!.drawImage(
    imgEl,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    size,
    size,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(new File([blob], "avatar.webp", { type: "image/webp" }))
          : reject(new Error("Canvas serialization failed")),
      "image/webp",
      0.9,
    );
  });
}

interface Props {
  userId: string;
  preferredName: string;
}

export default function AvatarUpload({ userId, preferredName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  // Blob URL of the file currently loaded in the cropper.
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  // Blob URL kept after a successful upload for immediate local preview.
  const [uploadedSrc, setUploadedSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const { upload, isPending } = useAvatarUpload(userId);

  const storageSrc = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${env.NEXT_PUBLIC_AVATARS_BUCKET}/${userId}`;

  const initials = preferredName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Revoke the pending blob URL on unmount to prevent memory leaks.
  useEffect(() => {
    return () => {
      if (pendingSrc) URL.revokeObjectURL(pendingSrc);
    };
  }, [pendingSrc]);

  const openFilePicker = useCallback(() => inputRef.current?.click(), []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (pendingSrc) URL.revokeObjectURL(pendingSrc);
      setPendingSrc(URL.createObjectURL(file));
      setCrop(undefined);
      setCompletedCrop(undefined);
      setDialogOpen(true);
      e.target.value = "";
    },
    [pendingSrc],
  );

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(
        centerCrop(
          makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
          width,
          height,
        ),
      );
    },
    [],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Prevent closing while an upload is in flight.
      if (!open && isPending) return;
      if (!open && pendingSrc) {
        URL.revokeObjectURL(pendingSrc);
        setPendingSrc(null);
      }
      setDialogOpen(open);
    },
    [isPending, pendingSrc],
  );

  const handleSave = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;
    const file = await exportCrop(imgRef.current, completedCrop);
    upload(file, {
      onSuccess: () => {
        setUploadedSrc(pendingSrc);
        setPendingSrc(null);
        setDialogOpen(false);
      },
    });
  }, [completedCrop, pendingSrc, upload]);

  return (
    <section className="w-full overflow-hidden rounded-md border border-zinc-800">
      <div className="flex flex-col gap-4 bg-zinc-900 px-4 py-5 inset-shadow-sm">
        <h3 className="text-xl font-bold">Profile Photo</h3>

        <div className="flex items-center gap-4">
          <Root className="inline-flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-linear-to-br from-cyan-400 to-cyan-500 text-2xl select-none">
            <Image
              src={uploadedSrc ?? storageSrc}
              alt={preferredName}
              className="size-full object-cover"
            />
            <Fallback className="font-bold text-zinc-900">{initials}</Fallback>
          </Root>
          <button
            type="button"
            className="text-sm text-zinc-400 hover:text-zinc-200 hover:underline"
            onClick={openFilePicker}
          >
            Upload a new photo…
          </button>
        </div>
      </div>

      <div className="flex items-center border-t border-zinc-800 bg-black px-4 py-3">
        <p className="text-xs text-zinc-500">
          JPEG · PNG · GIF · WEBP · AVIF &nbsp;·&nbsp; Max 5 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog.Root open={dialogOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-70 h-dvh w-screen bg-black/40 backdrop-blur-xs" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 z-70 w-screen max-w-lg -translate-1/2 px-2 focus:outline-none"
            onInteractOutside={(e) => isPending && e.preventDefault()}
            onEscapeKeyDown={(e) => isPending && e.preventDefault()}
          >
            <div className="flex flex-col overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 shadow-xl">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <Dialog.Title className="text-lg font-semibold">
                  Crop Photo
                </Dialog.Title>
                <Dialog.Close
                  className="rounded-sm p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending}
                  aria-label="Close"
                >
                  <PiXBold />
                </Dialog.Close>
              </div>

              <div className="bg-zinc-950">
                {pendingSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={setCrop}
                    onComplete={setCompletedCrop}
                    aspect={1}
                    circularCrop
                    keepSelection
                    className="max-h-[60vh] w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={pendingSrc}
                      alt="Crop preview"
                      className="max-h-[60vh] w-full object-contain"
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <button
                  type="button"
                  className="text-sm text-zinc-400 hover:text-zinc-200 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={openFilePicker}
                  disabled={isPending}
                >
                  Choose a different image
                </button>

                <div className="flex items-center gap-2">
                  <Dialog.Close
                    className="rounded-sm border border-zinc-700 bg-zinc-800 px-4 py-1 text-sm text-zinc-300 transition-[background-color,border-color,color] hover:border-zinc-600 hover:bg-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isPending}
                  >
                    Cancel
                  </Dialog.Close>
                  <FormButton
                    type="button"
                    className="flex items-center gap-1.5 rounded-sm bg-purple-900 px-4 py-1 font-medium ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950"
                    onClick={handleSave}
                    disabled={isPending || !completedCrop}
                  >
                    {isPending ? (
                      <PiSpinnerBold className="animate-spin" />
                    ) : (
                      <PiUploadSimpleBold />
                    )}
                    {isPending ? "Uploading…" : "Upload"}
                  </FormButton>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
