"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { createClient } from "~/lib/supabase";

export function useProfileIdentity(userId: string, initialName: string) {
  const [name, setName] = useState(initialName);

  const mutation = useMutation({
    mutationFn: async (preferredName: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profile")
        .update({ preferredName })
        .eq("userId", userId);
      if (error) throw error;
    },
  });

  return {
    name,
    setName,
    save: () => mutation.mutate(name),
    isPending: mutation.isPending,
  };
}
