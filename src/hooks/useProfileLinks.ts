"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import addProfileLink from "~/server/actions/profileLinks";
import { createClient } from "~/lib/supabase";
import type { profileLinks } from "~/server/db/schema/tables";

type ProfileLink = typeof profileLinks.$inferSelect;

export function useProfileLinks(initialLinks: ProfileLink[]) {
  const [links, setLinks] = useState(initialLinks);
  const [error, setError] = useState<string>();

  const addMutation = useMutation({
    mutationFn: async (url: string) => {
      const formData = new FormData();
      formData.append("url", url);
      const result = await addProfileLink(formData);
      if (result.error) throw new Error(result.error);
      return result.link!;
    },
    onSuccess: (link) => {
      setLinks((prev) => [...prev, link]);
      setError(undefined);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to add link.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profile_link")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: (id) => {
      const previous = links;
      setLinks((prev) => prev.filter((l) => l.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) setLinks(context.previous);
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profile_link")
        .update({ title })
        .eq("id", id);
      if (error) throw error;
      return { id, title };
    },
    onMutate: ({ id, title }) => {
      const previous = links;
      setLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, title } : l)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) setLinks(context.previous);
    },
  });

  return {
    links,
    error,
    addLink: (url: string) => addMutation.mutate(url),
    removeLink: (id: string) => removeMutation.mutate(id),
    updateLinkTitle: (id: string, title: string) =>
      updateTitleMutation.mutate({ id, title }),
    isAddingLink: addMutation.isPending,
    isRemovingLink: (id: string) =>
      removeMutation.isPending && removeMutation.variables === id,
    isUpdatingTitle: (id: string) =>
      updateTitleMutation.isPending && updateTitleMutation.variables?.id === id,
  };
}
