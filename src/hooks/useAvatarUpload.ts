"use client";

import { useMutation } from "@tanstack/react-query";
import { createClient } from "~/lib/supabase";
import { env } from "~/env";

export function useAvatarUpload(userId: string) {
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const supabase = createClient();
      const { error } = await supabase.storage
        .from(env.NEXT_PUBLIC_AVATARS_BUCKET)
        .upload(userId, file, { upsert: true });
      if (error) throw error;
    },
  });

  return {
    upload: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
