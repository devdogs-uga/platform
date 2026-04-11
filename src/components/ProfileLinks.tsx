"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  PiArrowUpBold,
  PiCheckBold,
  PiPencilSimpleBold,
  PiXBold,
} from "react-icons/pi";
import { useProfileLinks } from "~/hooks/useProfileLinks";
import type { profileLinks } from "~/server/db/schema/tables";
import FormButton from "./FormButton";

interface Props {
  initialLinks: (typeof profileLinks.$inferSelect)[];
}

function faviconUrl(url: string): string {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return "";
  }
}

interface LinkRowProps {
  link: typeof profileLinks.$inferSelect;
  onRemove: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
}

function LinkRow({ link, onRemove, onUpdateTitle }: LinkRowProps) {
  const [editing, setEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(link.title ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const favicon = faviconUrl(link.url);
  const displayTitle = link.title ?? new URL(link.url).hostname;

  const startEditing = useCallback(() => {
    setEditing(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const stopEditing = useCallback(() => {
    setEditing(false);
  }, []);

  const handleRemove = useCallback(() => {
    onRemove(link.id);
  }, [link.id, onRemove]);

  const handleTitleSubmit = useCallback(
    (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      onUpdateTitle(link.id, titleValue);
      setEditing(false);
    },
    [link.id, titleValue, onUpdateTitle],
  );

  return (
    <li className="flex max-w-lg flex-col gap-0.5 rounded-sm border border-zinc-700 bg-zinc-950 px-3.5 pb-3 pt-2.25">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {favicon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={favicon}
            alt=""
            width={16}
            height={16}
            className="mt-0.5 shrink-0 rounded-sm"
          />
        )}

        {editing ? (
          <form className="contents" onSubmit={handleTitleSubmit}>
            <input
              ref={inputRef}
              name="title"
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              placeholder={new URL(link.url).hostname}
              maxLength={100}
              className="form-input -ml-2 w-full rounded-sm border border-zinc-600 bg-zinc-900 px-2 py-0.5 text-sm ring-0 ring-zinc-400 transition-shadow focus:ring-1 focus:outline-none"
              onBlur={stopEditing}
            />
            <button
              type="submit"
              className="shrink-0 rounded-sm p-1.25 text-emerald-400/80 hover:bg-emerald-600/20 hover:text-emerald-300"
              aria-label="Save title"
            >
              <PiCheckBold />
            </button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={startEditing}
              className="group my-0.75 flex w-full items-center gap-1.5 text-left"
              title="Edit title"
            >
              <span className="truncate text-sm font-medium text-zinc-100">
                {displayTitle}
              </span>
              <PiPencilSimpleBold className="shrink-0 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="-my-0.75 rounded-sm p-1.25 text-rose-400/80 hover:bg-rose-600/20 hover:text-rose-300"
              aria-label={`Remove ${displayTitle}`}
            >
              <PiXBold />
            </button>
          </>
        )}
      </div>

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate px-7 font-mono text-xs text-zinc-500 hover:text-zinc-400 hover:underline"
      >
        {link.url}
      </a>
    </li>
  );
}

function AddLinkPreview({ url }: { url: string }) {
  const favicon = useMemo(() => {
    try {
      const { protocol, hostname } = new URL(url);
      if (protocol !== "http:" && protocol !== "https:") return null;
      return { favicon: faviconUrl(url), hostname };
    } catch {
      return null;
    }
  }, [url]);

  if (!favicon) return null;

  return (
    <div className="flex max-w-md items-center gap-2 rounded-sm border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={favicon.favicon}
        alt=""
        width={16}
        height={16}
        className="shrink-0 rounded-sm"
      />
      <span className="truncate text-zinc-300">{favicon.hostname}</span>
      <span className="ml-auto shrink-0 text-xs text-zinc-500">
        Title fetched on add
      </span>
    </div>
  );
}

export default function ProfileLinks({ initialLinks }: Props) {
  const { links, error, addLink, removeLink, updateLinkTitle, isAddingLink } =
    useProfileLinks(initialLinks);

  const [urlInput, setUrlInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const atMax = links.length >= 5;

  const handleAddSubmit = useCallback(
    (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      addLink(urlInput);
      setUrlInput("");
    },
    [urlInput, addLink],
  );

  return (
    <section className="w-full overflow-hidden rounded-md border border-zinc-800">
      <div className="flex flex-col gap-4 bg-zinc-900 px-4 py-5 inset-shadow-sm">
        <div>
          <h3 className="text-xl font-bold">Links</h3>
          <p className="mt-1.5 max-w-prose text-sm text-zinc-300">
            Add up to five links to your profile. We recommend your portfolio,
            LinkedIn, resume, and anything else you&rsquo;d like to share.
          </p>
        </div>

        <ul className="flex flex-col gap-2 empty:hidden">
          {links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              onRemove={removeLink}
              onUpdateTitle={updateLinkTitle}
            />
          ))}
        </ul>

        {!atMax && (
          <div className="flex flex-col gap-2">
            <form
              ref={formRef}
              className="flex max-w-md gap-1.5"
              onSubmit={handleAddSubmit}
            >
              <label className="flex w-full overflow-hidden rounded-sm border border-zinc-700 bg-zinc-950 ring-0 ring-zinc-400 transition-shadow focus-within:ring-1 has-disabled:cursor-not-allowed">
                <input
                  className="form-input w-full border-0 bg-zinc-950 px-3 font-mono inset-shadow-sm placeholder:text-zinc-600 focus:ring-0"
                  name="url"
                  type="url"
                  placeholder="https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isAddingLink}
                  required
                />
              </label>
              <FormButton
                className="rounded-sm bg-purple-900 px-4 py-1 font-medium text-nowrap ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950"
                type="submit"
              >
                <PiArrowUpBold />
                Add
              </FormButton>
            </form>

            <AddLinkPreview url={urlInput} />
          </div>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-zinc-800 bg-black p-4">
        <p className="text-sm text-zinc-400">
          {atMax
            ? "You've reached the 5-link limit."
            : `${links.length} of 5 links added.`}
        </p>
      </div>
    </section>
  );
}
