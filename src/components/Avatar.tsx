import { Fallback, Image, Root } from "@radix-ui/react-avatar";
import { getImageProps } from "next/image";
import { env } from "~/env";
import type { profiles } from "~/server/db/schema/tables";

export default function Avatar(profile: typeof profiles.$inferSelect) {
  const src = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${env.NEXT_PUBLIC_AVATARS_BUCKET}/${profile.userId}`;
  const { props: imgProps } = getImageProps({
    src,
    alt: profile.preferredName,
    width: 64,
    height: 64,
  });

  return (
    <Root className="inline-flex size-[1em] items-center justify-center overflow-hidden rounded-full border border-zinc-900 bg-linear-to-br from-cyan-400 to-cyan-500 align-middle shadow-xs select-none">
      <Image
        {...imgProps}
        className="size-full rounded-[inherit] object-cover"
      />
      <Fallback className="text-[0.5em]/none font-bold text-zinc-900">
        {profile.preferredName
          .split(" ")
          .map((name) => name.substring(0, 1))
          .join("")
          .toUpperCase()}
      </Fallback>
    </Root>
  );
}
