"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { createClient } from "~/lib/supabase";

type Provider = "github" | "discord";

interface AccountVisibility {
  showGithub: boolean;
  showDiscord: boolean;
}

export function useAccountVisibility(
  userId: string,
  initial: AccountVisibility,
) {
  const [showGithub, setShowGithub] = useState(initial.showGithub);
  const [showDiscord, setShowDiscord] = useState(initial.showDiscord);

  const mutation = useMutation({
    mutationFn: async ({
      provider,
      show,
    }: {
      provider: Provider;
      show: boolean;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profile")
        .update(
          provider === "github" ? { showGithub: show } : { showDiscord: show },
        )
        .eq("userId", userId);
      if (error) throw error;
      return { provider, show };
    },
    onMutate: ({ provider, show }) => {
      // Optimistic update
      const previous = provider === "github" ? showGithub : showDiscord;
      if (provider === "github") setShowGithub(show);
      else setShowDiscord(show);
      return { provider, previous };
    },
    onError: (_err, _vars, context) => {
      // Rollback on failure
      if (!context) return;
      if (context.provider === "github") setShowGithub(context.previous);
      else setShowDiscord(context.previous);
    },
  });

  return {
    showGithub,
    showDiscord,
    toggle: (provider: Provider) =>
      mutation.mutate({
        provider,
        show: provider === "github" ? !showGithub : !showDiscord,
      }),
    isPending: (provider: Provider) =>
      mutation.isPending && mutation.variables?.provider === provider,
  };
}
