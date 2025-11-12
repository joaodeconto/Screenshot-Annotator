using System;
using System.Threading.Tasks;

namespace SnipSnatch.Services;

public sealed class CaptureService
{
    // TODO: Implement Windows Graphics Capture
    public Task<byte[]?> CaptureRegionAsync()
    {
        // Placeholder: returns null until wired
        return Task.FromResult<byte[]?>(null);
    }
}

