"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  useActionState,
  useCallback,
  useEffect,
  useState,
  type FocusEvent,
} from "react";
import {
  PiArrowsClockwiseBold,
  PiCheckBold,
  PiCircleNotchBold,
  PiCopyBold,
  PiXBold,
} from "react-icons/pi";
import resetOAuthSecret from "~/server/actions/resetOAuthSecret";
import FormButton from "./FormButton";

interface CopyInputProps {
  value: string;
  disabled?: boolean;
}

function CopyInput({ value, disabled }: CopyInputProps) {
  const [copyState, setCopyState] = useState<
    "pristine" | "pending" | "success" | "failure"
  >("pristine");

  const handleCopy = useCallback(() => {
    if (disabled) {
      return;
    }

    setCopyState("pending");

    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopyState("success");
      })
      .catch((error) => {
        console.error(error);
        setCopyState("failure");
      });
  }, [disabled, value]);

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.setSelectionRange(0, -1, "none");
  }, []);

  useEffect(() => {
    if (copyState === "success" || copyState === "failure") {
      const timeout = setTimeout(() => {
        setCopyState((cs) =>
          cs === "success" || cs === "failure" ? "pristine" : cs,
        );
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [copyState]);

  return (
    <span className="flex max-w-md overflow-hidden rounded-sm border border-zinc-700 bg-zinc-950 ring-0 ring-zinc-400 transition-shadow focus-within:ring-1 has-disabled:cursor-not-allowed">
      <input
        className="form-input w-full border-0 bg-zinc-950 px-3 inset-shadow-sm placeholder:text-zinc-600 focus:ring-0 disabled:pointer-events-none"
        value={value}
        disabled={disabled}
        readOnly
        onFocus={handleFocus}
      />
      <button
        className="transition-color group m-1.5 flex items-center rounded-xs border border-zinc-700 bg-zinc-900 px-1.5 text-zinc-500 hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-400 disabled:pointer-events-none"
        type="button"
        onClick={handleCopy}
        disabled={copyState !== "pristine" || disabled}
        data-state={copyState}
        title="Copy"
      >
        <PiCopyBold className="hidden group-data-[state=pristine]:block" />
        <PiCircleNotchBold className="hidden animate-spin group-data-[state=pending]:block" />
        <PiCheckBold className="hidden text-emerald-300 group-data-[state=success]:block" />
        <PiXBold className="hidden text-rose-400 group-data-[state=failure]:block" />
      </button>
    </span>
  );
}

interface Props {
  userId: string;
}

export default function OAuthSecrets({ userId }: Props) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [{ oauthSecret }, dispatch, pending] = useActionState<{
    oauthSecret: string | null;
  }>(resetOAuthSecret, {
    oauthSecret: null,
  });

  console.log({ oauthSecret });

  useEffect(() => {
    if (!pending) {
      setAlertOpen(false);
    }
  }, [pending]);

  return (
    <AlertDialog.Root open={alertOpen} onOpenChange={setAlertOpen}>
      <div className="flex flex-col gap-5 bg-zinc-900 px-4 py-5 inset-shadow-sm">
        <h3 className="text-xl font-bold">OAuth</h3>

        <label className="flex flex-col gap-1.5">
          <span className="max-w-prose text-zinc-300">Client ID</span>
          <CopyInput value={userId} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="max-w-prose text-zinc-300">Client Secret</span>
          <CopyInput
            value={
              oauthSecret ?? "ddk_ • • • • • • • • • • • • • • • • • • • •"
            }
            disabled={oauthSecret === null}
          />
        </label>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 border-t border-zinc-800 bg-black p-4 font-medium sm:flex-row sm:justify-between">
        <p className="max-w-prose text-center text-sm text-balance text-zinc-400 sm:text-left">
          Client secrets cannot be accessed after they are generated: store them
          safely in your project&rsquo;s{" "}
          <span className="cursor-default rounded-sm bg-zinc-800 px-1 py-0.5 font-mono text-rose-300">
            .env
          </span>{" "}
          file!
        </p>

        <AlertDialog.Trigger asChild>
          <FormButton
            className="rounded-sm bg-purple-900 px-4 py-1 text-nowrap ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950"
            type="button"
          >
            <PiArrowsClockwiseBold /> Reset Client Secret
          </FormButton>
        </AlertDialog.Trigger>
      </div>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-70 h-dvh w-screen bg-black/40 backdrop-blur-xs" />

        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-70 w-screen max-w-md -translate-1/2 px-2">
          <form
            className="flex flex-col gap-6 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-6 font-medium text-zinc-200 shadow-xl"
            action={dispatch}
          >
            <AlertDialog.Title className="flex items-center gap-2 text-2xl/none font-semibold">
              Reset Client Secret
            </AlertDialog.Title>
            <AlertDialog.Description>
              Resetting your client secret invalidates your existing client
              secret. This means you won&rsquo;t be able to continue using the
              existing secret.
            </AlertDialog.Description>
            <div className="flex items-center justify-end gap-4">
              <AlertDialog.Cancel className="rounded-sm border border-zinc-700 bg-zinc-800 px-4 py-1 shadow-xs transition-[background-color,color,border-color,box-shadow] hover:border-zinc-600 hover:bg-zinc-700 hover:text-white hover:shadow-sm">
                Cancel
              </AlertDialog.Cancel>
              <FormButton
                className="rounded-sm bg-rose-900 px-4 py-1 ring-rose-900 inset-ring-rose-900 hover:bg-rose-100 hover:text-rose-950"
                type="submit"
              >
                Continue
              </FormButton>
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
