import Link from "next/link";
import type { ComponentProps } from "react";

export default function LinkButton({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`relative flex items-center justify-center gap-[1ch] text-white shadow-sm ring-1 inset-ring-0 transition-[color,background-color,box-shadow] *:transition-opacity not-disabled:hover:shadow-md not-disabled:hover:inset-ring-3 disabled:text-transparent disabled:opacity-75 disabled:not-data-pending:cursor-not-allowed disabled:*:first:opacity-100 data-pending:cursor-progress ${className}`}
    />
  );
}
