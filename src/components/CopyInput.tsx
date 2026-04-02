"use client";

import { useState, useCallback, useEffect, type FocusEvent } from "react";
import {
  PiCopyBold,
  PiCircleNotchBold,
  PiCheckBold,
  PiXBold,
} from "react-icons/pi";

interface Props {
  value: string;
  disabled?: boolean;
}

export default function CopyInput({ value, disabled }: Props) {
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
        className="form-input w-full border-0 bg-zinc-950 px-3 inset-shadow-sm placeholder:text-zinc-600 focus:ring-0 disabled:pointer-events-none disabled:text-zinc-600"
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
