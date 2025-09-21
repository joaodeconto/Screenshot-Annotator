# Screenshot-Annotator

- [Screenshot-Annotator](#screenshot-annotator)
- [Features](#features)
- [Quick Start](#quick-start)
- [Windows wrapper – "Snip & Snatch"](#windows-wrapper--snip--snatch)
- [Usage](#usage)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Export and Share](#export-and-share)
- [Roadmap — "Snip & Snatch" (Windows)](#roadmap--snip--snatch-windows)
- [Development Notes](#development-notes)

Um único index.html que abre/cola uma imagem e permite:

- Seta, Retângulo, Elipse, Texto
- Marcador (highlight semitransparente)
- Redigir (caixa sólida)
- Pixelar (blur modo mosaico)
- Desfazer, Limpar, Exportar PNG
- Drag-and-drop e colar do clipboard (Ctrl/⌘+V)

English summary: One-file, no-build image annotator. Open or paste an image, add arrows/boxes/text/highlights, redact or pixelate, undo/clear, and export a PNG.

## Features

- Fast one-file app: just `index.html` in a browser
- Tools: Arrow, Rectangle, Ellipse, Text, Highlighter, Redact, Pixelate
- Input: File picker, drag-and-drop, paste from clipboard
- Controls: Color and thickness per tool
- History: Undo last operation, Clear all
- Export: Download annotated PNG

## Quick Start

1) Open `index.html` directly in your browser.
2) Drag an image onto the page or press the Paste button and paste with Ctrl/⌘+V.
3) Select a tool, draw, and export.

Tip: Works offline. Modern browsers recommended (Edge/Chrome/Firefox).

## Windows wrapper – "Snip & Snatch"

Phase 1 of the Windows roadmap is available in `windows/SnipAndSnatch.Desktop`. It's a small WPF/WebView2 host that bundles the existing `index.html` and adds Windows-specific affordances:

- Abrir imagem via diálogo nativo e enviar direto para o canvas
- Colar do clipboard do Windows (Ctrl+V ou botão dedicado)
- Arrastar soltar arquivos na janela
- Passar caminho de arquivo via linha de comando (`SnipAndSnatch.exe c\temp\capture.png`)

Veja `windows/README.md` para requisitos, build (`dotnet publish`) e próximos passos.

## Usage

- Load image: Use the file input, drag-and-drop, or paste from clipboard.
- Choose tool: Arrow, Rect, Ellipse, Text, Highlighter, Redact, Pixelate.
- Draw: Click and drag. For Text, click once, type, Enter to commit.
- Color/Thickness: Adjust using the controls in the toolbar.
- Undo/Clear: Revert last step or reset the canvas.

## Keyboard Shortcuts

- Ctrl/⌘+V: Paste image from clipboard
- Ctrl/⌘+Z: Undo last operation

## Export and Share

- Export PNG: Click “Exportar PNG” to download.
- Copy to clipboard: After exporting, you can re-open and paste into chats, docs, or issue trackers. Many AI chat UIs support pasting images with your text prompt.

Planned sharing additions (see roadmap):
- “Copy as PNG” button (direct clipboard copy from canvas)
- “Copy as Markdown” with embedded image (data URL) for quick paste
- “Send to …” actions (open target with image attached when supported)

## Roadmap — "Snip & Snatch" (Windows)

Goal: A native-feeling Windows app focused on ultra-fast capture → annotate → paste/share to AI assistants.

Phases:

1) Wrap current app as desktop (WebView2) — ✅ disponível em `windows/SnipAndSnatch.Desktop`
   - [x] Shell app (WPF) hospedando `index.html` via WebView2
   - [x] Single-EXE distribution via publish self-contained (`dotnet publish` exemplo no README)
   - [x] File protocol/IPC: abre arquivos, cola do clipboard, drag-and-drop e argumento de linha de comando

2) Snip integration (capture)
   - Use Windows Graphics Capture API for region/window/fullscreen capture
   - Global hotkey (e.g. PrintScreen or configurable) to start capture → auto-open annotator
   - Paste pipeline: auto-copy annotated output to clipboard on Export

3) Power user polish
   - Copy to clipboard (PNG) without a save dialog
   - Copy as Markdown with embedded data URL (optional size guard)
   - Quick color presets and tool cycling shortcuts

4) “Send to AI” actions
   - Configurable targets (e.g., ChatGPT, local tools) launched with the image ready to paste
   - Optional helper that monitors clipboard and auto-focuses target app

Notes on tech choices:
- WebView2 keeps footprint small and performance snappy on Windows
- Native capture via Windows Graphics Capture provides crisp, multi-monitor support
- Everything continues to work offline; no cloud dependency

## Development Notes

- This repo’s core is `index.html` — a single file with HTML/CSS/JS.
- Keep changes minimal and fast; avoid heavy dependencies.
- For Windows wrapper, prefer a thin host project and load `index.html` as-is.
