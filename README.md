# Screenshot Annotator

React + TypeScript rewrite of the original single-file canvas tool. Still zero backend: open the page, drop or paste an image, annotate, and export a PNG.

English summary: lightweight offline image annotator implemented with React, TypeScript, and Vite. Supports arrows, boxes, ellipses, free text, highlights, redact boxes, blur/pixelate, undo/clear, screen capture, and PNG export.

## Features

- Tools: Arrow, Rectangle, Ellipse, Text, Highlighter, Redact, Pixelate
- Inputs: File picker, drag-and-drop, clipboard paste (Ctrl/+V), and browser screen capture
- Controls: Color picker and adjustable stroke thickness per tool
- History: Undo (Ctrl/+Z) with snapshot stack and clear canvas
- Clipboard: Copy annotated PNG directly (Ctrl/+C or Copiar button)
- Guides: Toggleable alignment grid, spacing control, and a pixel-perfect 1:1 lock for detail work
- Export: Download annotated PNG files (one click) or copy a Markdown snippet with an inline data URL
- UX niceties: Floating text editor, responsive canvas scaling, quick color swatches, clipboard button, Windows snipping hook via `window.__snipPending`

## Quick Start

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173) and start annotating. For a production bundle:

```bash
npm run build
```

Deploy the `dist/` folder (GitHub Pages, Vercel, Netlify, etc.).

## Usage

- Load an image via file picker, drag-and-drop, clipboard paste, or screen capture.
- Select a tool on the toolbar. Buttons show pressed state for the current tool.
- Click and drag to draw. For Text, click once, type, press Enter (Esc cancels).
- Use the color picker and thickness input to configure lines/fills.
- Undo reverts the last canvas change; Clear resets to the original image.
- Copiar PNG uses the Clipboard API for instant paste into chats/docs; Export downloads `annotated-<timestamp>.png`.

## Keyboard Shortcuts

- `Ctrl/+V` (or `Cmd/+V` on macOS): paste image from clipboard
- `Ctrl/+Z` (or `Cmd/+Z`): undo last action
- `Ctrl/+C` (or `Cmd/+C`): copy annotated PNG to clipboard
- Tool jumps: `A` arrow, `R` rectangle, `E` ellipse, `T` text, `H` highlighter, `X` redact, `B` pixelate, `D` draw, `C` crop
- Toggles: `G` grid on/off, `L` lock/unlock 1:1 scale

## Export and Share

- `Copiar PNG` usa o Clipboard API para colar direto em chats, issues ou documentos.
- `Exportar PNG` downloads the annotated canvas as a PNG.
- The resulting file can be inserted directly into docs, issues, or AI chat UIs.
- Planned additions (see roadmap):
  - Copy-as-PNG to clipboard
  - Copy-as-Markdown snippet with embedded data URL
  - "Send to..." integrations for popular AI assistants

## Roadmap - "Snip & Snatch" (Windows)

Goal: native-feeling Windows experience for capture -> annotate -> share in seconds.

1. **Desktop wrapper**
   - WinUI 3/WPF host using WebView2 pointing at the built app
   - Single-file distribution via self-contained publish
   - Lightweight IPC to push captured images into the canvas
2. **Snipping integration**
   - Windows Graphics Capture API for region/window/fullscreen grab
   - Global hotkey (PrintScreen or user-defined) that opens the annotator automatically
   - Automatic clipboard copy after export
3. **Power-user polish**
   - Clipboard export without dialog
   - Markdown copy with inline data URL (size-guarded)
   - Quick color presets and keyboard tool cycling
4. **Send-to-AI actions**
   - Configurable targets (ChatGPT, local apps, etc.) launched with image pre-attached
   - Optional helper watching clipboard focus to speed up pasting

## Development Notes

- Stack: React 19, TypeScript, Vite, Canvas 2D API.
- `npm run dev` for HMR, `npm run build` for production, `npm run lint` for ESLint.
- Canvas logic mirrors the legacy single-file version but split into hooks/functions for clarity.
- `docs/layout_reference.png` keeps the visual reference used during the refactor.
- No extra runtime dependencies were needed beyond React itself.
