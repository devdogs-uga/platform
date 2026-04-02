"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useActionState, useEffect, useState } from "react";
import { PiArrowsClockwiseBold } from "react-icons/pi";
import resetOAuthSecret from "~/server/actions/resetOAuthSecret";
import FormButton from "./FormButton";
import CopyInput from "./CopyInput";

type ActionState =
  | {
      clientId: string;
      clientSecret: string;
    }
  | {
      clientId: string;
      clientSecret: null;
    }
  | {
      clientId: null;
      clientSecret: null;
    };

interface Props {
  clientId: string | null;
}

export default function OAuthSecrets({ clientId: defaultClientId }: Props) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [{ clientId, clientSecret }, dispatch, pending] =
    useActionState<ActionState>(resetOAuthSecret, {
      clientId: defaultClientId,
      clientSecret: null,
    });

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
          <CopyInput
            value={clientId ?? "(No client exists)"}
            disabled={clientId === null}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="max-w-prose text-zinc-300">Client Secret</span>
          <CopyInput
            value={
              clientId
                ? (clientSecret ??
                  "ddk_ • • • • • • • • • • • • • • • • • • • •")
                : "(No client exists)"
            }
            disabled={clientSecret === null}
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
            <PiArrowsClockwiseBold /> Reset Client Keys
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
              Reset Client Keys
            </AlertDialog.Title>
            <AlertDialog.Description>
              Resetting your client keys invalidates your existing client ID and
              secret. This means you won&rsquo;t be able to continue using them
              in your projects.
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
