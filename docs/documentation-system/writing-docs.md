# Writing Documentation

All documentation lives in the `docs/` folder of each DevDogs-UGA repository. This guide covers how to write, format, and organize markdown files so they render correctly on the live docs site and in the local preview tool.

## File structure

Every markdown file must start with a `# ` heading. That heading is the page title — it appears in the browser, the sidebar, and search results. Do not add front matter; the title comes from the heading, and sidebar ordering comes from `meta.json`.

```
docs/
  meta.json          ← sidebar order for the top level
  getting-started.md
  contributing.md
  advanced/
    meta.json        ← sidebar order for this subfolder
    configuration.md
    deployment.md
```

## Sidebar ordering with `meta.json`

Place a `meta.json` file in `docs/` or any subfolder to control how pages appear in the sidebar.

```json
{
  "title": "Advanced",
  "pages": [
    "configuration",
    { "name": "deployment", "label": "Deploy to Production" },
    "...rest"
  ]
}
```

- **`title`** — overrides the sidebar label for the folder itself.
- **`pages`** — controls order. Files listed here appear in order; `"...rest"` inserts any unlisted files alphabetically at that position. Files absent from `pages` (with no `"...rest"`) are hidden from the sidebar.
- **Object form** `{ "name": "file", "label": "Custom Label" }` — overrides the sidebar label for a specific page without editing the file.
- Filenames in `pages` are written **without** the `.md` extension.

## Supported syntax

### GitHub Flavored Markdown

Standard GFM is fully supported: headings, bold/italic, tables, task lists, blockquotes, inline code, fenced code blocks, and autolinks.

### Code blocks with syntax highlighting

Use a language tag to get syntax highlighting:

````md
```typescript
const greeting = (name: string) => `Hello, ${name}!`;
```
````

Supported languages include `typescript`, `tsx`, `javascript`, `jsx`, `bash`, `sql`, `json`, `css`, `html`, `python`, and many more (powered by [Shiki](https://shiki.style)).

### Code tabs

Group related code blocks under labelled tabs using the `tab` attribute:

````md
```bash tab="pnpm"
pnpm install
```

```bash tab="npm"
npm install
```
````

### Admonitions (callouts)

Use GitHub-style blockquote callouts for notes, warnings, and tips:

```md
> [!NOTE]
> This is a note. Use it for additional context.

> [!WARNING]
> This is a warning. Use it for things that could go wrong.

> [!TIP]
> This is a tip. Use it for recommended approaches.
```

### Links

Use standard markdown links. Relative links between docs files work correctly:

```md
See the [Getting Started](../getting-started.md) guide.
```

Anchor links to headings also work:

```md
See the [code block](#code-blocks-with-syntax-highlighting) section above.
```

## What to avoid

- **No front matter** — do not add `---` YAML blocks. Titles come from `# ` headings; ordering comes from `meta.json`.
- **No HTML** — use markdown syntax. Raw HTML may not render correctly in all contexts.
- **No single-file front matter for labels** — if you want a different sidebar label, use the object form in `meta.json` instead of editing the file.
