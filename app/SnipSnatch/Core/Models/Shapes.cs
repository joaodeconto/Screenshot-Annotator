namespace SnipSnatch.Core.Models;

public enum ToolKind
{
    Arrow,
    Rect,
    Ellipse,
    Text,
    Highlight,
    Redact,
    Pixelate
}

public record Style(string StrokeHex, float Thickness, float Alpha = 1.0f);

public abstract record Shape(Style Style);
public record ArrowShape(Style Style, float X1, float Y1, float X2, float Y2) : Shape(Style);
public record RectShape(Style Style, float X, float Y, float W, float H, bool Fill = false) : Shape(Style);
public record EllipseShape(Style Style, float X, float Y, float W, float H, bool Fill = false) : Shape(Style);
public record TextShape(Style Style, float X, float Y, string Text, float FontSize) : Shape(Style);
public record PixelateRegion(Style Style, float X, float Y, float W, float H, int Pixel = 12) : Shape(Style);

