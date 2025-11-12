using SnipSnatch.Core.Commands;
using SnipSnatch.Core.Models;

namespace SnipSnatch.ViewModels;

public sealed class EditorViewModel
{
    public ToolKind Tool { get; set; } = ToolKind.Arrow;
    public string Color { get; set; } = "#ff5252";
    public float Thickness { get; set; } = 6;
    public CommandHistory History { get; } = new();
}

