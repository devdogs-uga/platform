"use client";

import { useCallback } from "react";
import { PiEnvelopeSimpleBold, PiUserBold } from "react-icons/pi";
import { useProfileIdentity } from "~/hooks/useProfileIdentity";
import FormButton from "./FormButton";
import IconInput from "./IconInput";

interface Props {
  userId: string;
  initialName: string;
  email: string;
}

export default function ProfileIdentity({ initialName, email, userId }: Props) {
  const { name, setName, save, isPending } = useProfileIdentity(
    userId,
    initialName,
  );

  const handleSubmit = useCallback(
    (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      save();
    },
    [save],
  );

  return (
    <section className="w-full overflow-hidden rounded-md border border-zinc-800">
      <form className="contents" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 bg-zinc-900 px-4 py-5 inset-shadow-sm">
          <h3 className="text-xl font-bold">Identity</h3>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">
              Preferred Name
            </label>
            <IconInput
              icon={<PiUserBold />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={1}
              maxLength={32}
              name="preferredName"
              type="text"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <IconInput
              icon={<PiEnvelopeSimpleBold />}
              value={email}
              readOnly
              disabled
              type="email"
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-zinc-800 bg-black p-4 font-medium">
          <p className="max-w-prose text-sm text-zinc-400">
            Your email is set by your UGA Google account and cannot be changed
            here.
          </p>

          <FormButton
            className="rounded-sm bg-purple-900 px-4 py-1 ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950"
            type="submit"
            disabled={isPending}
          >
            Save
          </FormButton>
        </div>
      </form>
    </section>
  );
}
