using System;
using System.IO;
using System.Text.Json;

namespace SnipSnatch.Services;

public sealed class Settings
{
    public string Hotkey { get; set; } = "PrintScreen";
    public string[] Palette { get; set; } = new[] { "#ffffff", "#ff5252", "#ffbf00", "#4ade80", "#60a5fa", "#a78bfa" };
    public int DefaultThickness { get; set; } = 6;
    public bool DownscaleOnCopy { get; set; } = false;
    public int MaxWidth { get; set; } = 1600;
}

public sealed class SettingsService
{
    private readonly string _path;

    public SettingsService()
    {
        var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SnipSnatch");
        Directory.CreateDirectory(dir);
        _path = Path.Combine(dir, "config.json");
    }

    public Settings Load()
    {
        try
        {
            if (File.Exists(_path))
            {
                var json = File.ReadAllText(_path);
                return JsonSerializer.Deserialize<Settings>(json) ?? new Settings();
            }
        }
        catch { }
        return new Settings();
    }

    public void Save(Settings s)
    {
        try
        {
            var json = JsonSerializer.Serialize(s, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_path, json);
        }
        catch { }
    }
}

