using System.Threading.Tasks;

namespace SnipSnatch.Services;

public sealed class ClipboardService
{
    // TODO: Implement PNG placement via DataPackage
    public Task<bool> CopyPngAsync(byte[] pngBytes)
    {
        // Placeholder
        return Task.FromResult(false);
    }
}

