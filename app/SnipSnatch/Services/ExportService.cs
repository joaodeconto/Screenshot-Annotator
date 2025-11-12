using System;
using System.IO;
using System.Threading.Tasks;

namespace SnipSnatch.Services;

public sealed class ExportService
{
    public async Task<string?> ExportPngAsync(byte[] pngBytes, string? filePath = null)
    {
        try
        {
            filePath ??= Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyPictures), $"snip-{DateTime.Now:yyyyMMdd-HHmmss}.png");
            await File.WriteAllBytesAsync(filePath, pngBytes);
            return filePath;
        }
        catch
        {
            return null;
        }
    }
}

