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
import CopyInput from "./CopyInput";
import resetTicTacToeKey from "~/server/actions/resetTicTacToeKey";

interface Props {
  publicKey: string | null;
}

export default function OAuthSecrets({ publicKey: defaultPublicKey }: Props) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [{ publicKey }, dispatch, pending] = useActionState<Props>(
    resetTicTacToeKey,
    { publicKey: defaultPublicKey },
  );

  useEffect(() => {
    if (!pending) {
      setAlertOpen(false);
    }
  }, [pending]);

  return (
    <AlertDialog.Root open={alertOpen} onOpenChange={setAlertOpen}>
      <div className="flex flex-col gap-5 bg-zinc-900 px-4 py-5 inset-shadow-sm">
        <h3 className="text-xl font-bold">TicTacToe</h3>

        <label className="flex flex-col gap-1.5">
          <span className="max-w-prose text-zinc-300">Public Key</span>
          <CopyInput
            value={publicKey ?? "(No key exists)"}
            disabled={publicKey === null}
          />
        </label>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 border-t border-zinc-800 bg-black p-4 font-medium sm:flex-row sm:justify-between">
        <p className="max-w-prose text-center text-sm text-balance text-zinc-400 sm:text-left">
          This key is safe to share publicly.
        </p>

        <AlertDialog.Trigger asChild>
          <FormButton
            className="rounded-sm bg-purple-900 px-4 py-1 text-nowrap ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950"
            type="button"
          >
            <PiArrowsClockwiseBold /> Reset API Key
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
              Reset API Key
            </AlertDialog.Title>
            <AlertDialog.Description>
              Resetting your API key invalidates your existing key. This means
              you won&rsquo;t be able to continue using it in your projects.
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
