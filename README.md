# Snip & Snatch — Windows Screenshot Annotator

Fast capture → annotate → paste to AI assistants and chats. Windows‑first, privacy‑first, offline by default.

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Flow](#quick-flow)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [AI Integrations](#ai-integrations)
- [Architecture](#architecture)
- [Install](#install)
- [Build From Source](#build-from-source)
- [Project Structure (Proposed)](#project-structure-proposed)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

Snip & Snatch is a native‑feeling Windows app that makes it instant to capture a region/window/screen, add clear annotations (arrows, boxes, text, highlight, redact, pixelate), and paste straight into AI assistants or chats. It focuses on speed, clarity, and a frictionless clipboard pipeline.

Status: Pre‑alpha (design + planning). We’re shaping the Windows app and integration points before publishing the first binary.

## Key Features

- Capture: Region, window, or fullscreen. Multi‑monitor aware, crisp on HiDPI.
- Annotate: Arrow, Rectangle, Ellipse, Text, Highlighter, Redact, Pixelate.
- Controls: Color palette, thickness, Undo, Clear.
- Output: Copy PNG to clipboard, Export PNG (PNG only by design in MVP).
- Speed: Global hotkey to capture and jump into annotate mode in under a second.
- Privacy: 100% local; no accounts, no upload, works offline.

Planned polish:
- Magnifier + pixel grid when selecting a region.
- Quick color presets and number‑key tool switching.
- Optional auto‑downscale for chat‑friendly images.

## Quick Flow

1) Press the global hotkey to start capture (e.g. PrintScreen).
2) Drag to select a region (or choose a window/screen).
3) Annotate with arrow/box/text/highlight; Undo as needed.
4) Press Copy to place a PNG on the clipboard and paste into your AI chat.

## Keyboard Shortcuts

- PrintScreen: Global hotkey to capture
- Ctrl+Z: Undo
- 1–7: Tool shortcuts (planned)
- C: Copy PNG to clipboard (planned)
- E: Export to file (planned)

## AI Integrations

- Works everywhere you can paste images: ChatGPT, GitHub/GitLab issues, Slack/Teams, Notion, etc.
- Optional “Copy as Markdown” for docs/issues: `![alt](data:image/png;base64,...)`.
- Future “Send to …” actions to focus a target app/site after copying.

## Architecture

- UI: WinUI 3 (.NET 8), minimal chrome, keyboard‑first, system theme aware.
- Rendering: Win2D `CanvasControl` for fast, crisp 2D drawing on the GPU.
- Capture: Windows Graphics Capture API (region/window/fullscreen, HiDPI aware).
- Clipboard: `DataPackage` PNG bitmap copy (PNG only in MVP).
- Undo/History: Command pattern with periodic bitmap checkpoints for raster ops.
- Settings: JSON under `%LocalAppData%/SnipSnatch/config.json` (no telemetry).
- Packaging: Portable self‑contained x64 build (.zip). Optional MSIX later.

Design principles:
- Invisible UI: neutral, low‑chroma surface that fades behind content.
- Speed: low latency from hotkey to annotated image on clipboard.
- Privacy: 100% local; zero telemetry and no network dependency.

## Install

Prebuilt releases: coming soon on the Releases page.

Requirements (runtime):
- Windows 10/11 x64

## Build From Source

Prerequisites:
- Windows 11 or 10, Visual Studio 2022
- .NET 8 SDK, Windows App SDK (WinUI 3), Win2D.UWP NuGet (Win2D for WinUI 3)

High‑level steps (will be refined once code lands):
1) Clone the repo
2) Open the Windows solution in Visual Studio
3) Build and run the WinUI 3 app

## Project Structure (Proposed)

```
app/                    # WinUI 3 solution
  SnipSnatch/           # Main Windows project (.csproj)
    Views/              # MainWindow, EditorPage, Overlay (capture)
    ViewModels/         # EditorViewModel, SettingsViewModel
    Rendering/          # Win2D Canvas + Renderer classes
    Core/               # Models (shapes), Commands, History
    Services/           # Capture, Clipboard, Hotkey, Settings, Export
    Resources/          # Styles, icons, cursors
assets/                 # App icons, sample images
docs/                   # Guides and design notes
```

## Roadmap

M1 — Core capture + annotate
- Region/window/fullscreen capture, basic toolbar, Undo/Clear
- Copy to Clipboard (PNG), Export PNG

M2 — Power user quality
- Magnifier, color presets (neutral, "invisible" defaults), number‑key tool shortcuts
- Optional downscale‑on‑copy (default off). Preferred max width: 1600px
- Configurable hotkeys (override PrintScreen)

M3 — Integrations
- Copy as Markdown (optional), “Send to …” targets, MSIX packaging and updates

## Contributing

Issues and PRs are welcome. Please keep performance, simplicity, and privacy in mind. Small, surgical changes beat big frameworks.

## License

MIT — see LICENSE.
