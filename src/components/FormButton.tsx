"use client";

import type { DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { PiCircleNotchBold } from "react-icons/pi";

export default function FormButton({
  children,
  className,
  disabled,
  ...props
}: DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      className={`relative flex items-center justify-center gap-[1ch] text-white shadow-sm ring-1 inset-ring-0 transition-[color,background-color,box-shadow] *:transition-opacity not-disabled:hover:shadow-md not-disabled:hover:inset-ring-3 disabled:text-transparent disabled:opacity-75 disabled:not-data-pending:cursor-not-allowed disabled:*:first:opacity-100 data-pending:cursor-progress ${className}`}
      disabled={pending || disabled}
      data-pending={pending || undefined}
    >
      <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 text-white opacity-0">
        <PiCircleNotchBold className="animate-spin [animation-duration:750ms]" />
      </span>
      {children}
    </button>
  );
}
