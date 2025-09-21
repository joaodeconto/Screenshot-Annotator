# Snip & Snatch (Windows wrapper)

A Windows desktop shell that embeds the web-based annotator inside a lightweight WebView2 host.

## Project layout

```
windows/
└── SnipAndSnatch.Desktop/
    ├── App.xaml / App.xaml.cs          # WPF entry point
    ├── MainWindow.xaml(.cs)            # WebView2 host + shell commands
    ├── SnipAndSnatch.Desktop.csproj    # .NET 6 WPF project
    └── SnipAndSnatch.Desktop.sln       # Solution for Visual Studio / Rider
```

The project copies the repository's root `index.html` into `wwwroot/index.html` at build time so the packaged desktop app stays in sync with the browser version.

## Features implemented (Phase 1 of the roadmap)

- Hosts the existing UI inside Microsoft Edge WebView2.
- "Abrir imagem..." button loads a file via Windows file picker and injects it into the canvas.
- "Colar do clipboard" pulls the latest bitmap from the Windows clipboard and sends it straight into the annotator.
- Drag-and-drop of files directly onto the window.
- Passing an image path as a command-line argument also preloads the canvas (`SnipAndSnatch.exe path\to\image.png`).

These cover the desktop wrapping + basic IPC items in Phase 1 of the "Snip & Snatch" roadmap. Capture and automation steps remain future work.

## Build and publish

Requirements:

- Windows 10 20H1 (build 19041) or later.
- .NET 6 SDK (or Visual Studio 2022 with .NET desktop workload).

### Run in Visual Studio

1. Open `SnipAndSnatch.Desktop.sln`.
2. Restore NuGet packages (WebView2) if prompted.
3. Set the project as the startup project and press <kbd>F5</kbd>.

### CLI build / single-file publish

```
dotnet publish windows/SnipAndSnatch.Desktop/SnipAndSnatch.Desktop.csproj \
  -c Release \
  -r win-x64 \
  --self-contained true \
  -p:PublishSingleFile=true \
  -p:IncludeNativeLibrariesForSelfExtract=true
```

The publish output contains a self-contained `SnipAndSnatch.exe` that you can distribute. WebView2 runtime is required on the target machine (installed with recent Edge versions).

## Next steps

- Hook Windows Graphics Capture to feed screenshots directly into `PushOrQueueAsync`.
- Add automation hooks (e.g., clipboard monitoring, "Send to AI" shortcuts).
- Share a packaged download via GitHub Releases.
