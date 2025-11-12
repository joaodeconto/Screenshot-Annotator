using System;

namespace SnipSnatch.Services;

public sealed class HotkeyService
{
    // TODO: Register global PrintScreen hotkey; for now, stub events
    public event EventHandler? CaptureRequested;

    public void SimulateCaptureRequest() => CaptureRequested?.Invoke(this, EventArgs.Empty);
}

