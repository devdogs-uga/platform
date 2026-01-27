import type { DetailedHTMLProps, InputHTMLAttributes, ReactNode } from "react";

interface Props extends Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  "prefix"
> {
  icon: ReactNode;
  prefix?: ReactNode;
}

export default function IconInput({
  icon,
  prefix,
  className,
  ...inputProps
}: Props) {
  return (
    <label className="flex max-w-sm overflow-hidden rounded-sm border border-zinc-700 ring-0 ring-zinc-400 transition-shadow focus-within:ring-1">
      <span className="flex items-center bg-zinc-800 px-3 text-zinc-500">
        {icon}
      </span>
      <span className="pointer-events-none bg-zinc-950 py-2 pl-3 text-nowrap text-zinc-400">
        {prefix}
      </span>
      <input
        className={
          "form-input w-full border-0 bg-zinc-950 px-0 inset-shadow-sm placeholder:text-zinc-600 focus:ring-0 " +
          className
        }
        {...inputProps}
      />
    </label>
  );
}
