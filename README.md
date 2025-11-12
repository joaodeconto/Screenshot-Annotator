# Screenshot-Annotator

- [Screenshot-Annotator](#screenshot-annotator)
- [Features](#features)
- [Quick Start](#quick-start)
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
- Copiar PNG direto pro clipboard (botão ou Ctrl/⌘+C)
- Capturar a tela usando getDisplayMedia (botão “Capturar Tela”)
- Drag-and-drop e colar do clipboard (Ctrl/⌘+V)

English summary: One-file, no-build image annotator. Open or paste an image, add arrows/boxes/text/highlights, redact or pixelate, undo/clear, and export a PNG.

## Features

- Fast one-file app: just `index.html` in a browser
- Tools: Arrow, Rectangle, Ellipse, Text, Highlighter, Redact, Pixelate
- Input: File picker, drag-and-drop, paste from clipboard, or screen capture via getDisplayMedia
- Text editor: floating palette with color + font presets
- Controls: Color and thickness per tool
- History: Undo last operation, Clear all
- Export: Download or copy annotated PNG

## Quick Start

1) Open `index.html` directly in your browser.
2) Carregue uma imagem (arquivo, drag-and-drop, Paste) ou clique **Capturar Tela** para selecionar uma janela/monitor.
3) Escolha a ferramenta, desenhe e ajuste cor/espessura ou texto.
4) Copie (Ctrl/⌘+C) ou exporte em PNG.

Tip: Works offline. Modern browsers recommended (Edge/Chrome/Firefox).

## Usage

- Load image: Use the file input, drag-and-drop, paste from clipboard, or **Capturar Tela** (permite escolher monitor/janela via navegador).
- Choose tool: Arrow, Rect, Ellipse, Text, Highlighter, Redact, Pixelate.
- Draw: Click and drag. For Text, clique uma vez, use o editor flutuante (cor/fonte) e Enter para aplicar.
- Color/Thickness: Adjust using the controls in the toolbar.
- Undo/Clear: Revert last step or reset the canvas.

## Keyboard Shortcuts

- Ctrl/⌘+V: Paste image from clipboard
- Ctrl/⌘+Z: Undo last operation
- Ctrl/⌘+C: Copy annotated PNG to clipboard

## Export and Share

- Export PNG: Click “Exportar PNG” to download.
- Copy PNG: Use “Copiar (Ctrl/⌘+C)” or the shortcut to enviar o canvas direto pro clipboard e colar em chats, docs ou assistentes de IA.

Planned sharing additions (see roadmap):
- “Copy as Markdown” with embedded image (data URL) for quick paste
- “Send to …” actions (open target with image attached when supported)

## Roadmap — "Snip & Snatch" (Windows)

Goal: A native-feeling Windows app focused on ultra-fast capture → annotate → paste/share to AI assistants.

Phases:

1) Wrap current app as desktop (WebView2)
   - Shell app (WinUI 3 or WPF) hosting `index.html` via WebView2
   - Single-EXE distribution using self-contained publish
   - File protocol/IPC to pass captured images into the canvas

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
