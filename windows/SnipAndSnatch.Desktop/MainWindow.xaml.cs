using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media.Imaging;
using Microsoft.Web.WebView2.Core;
using Microsoft.Win32;

namespace SnipAndSnatch;

public partial class MainWindow : Window
{
    private bool _webReady;
    private string? _pendingDataUrl;

    public MainWindow()
    {
        InitializeComponent();
        Loaded += OnLoaded;

        CommandBindings.Add(new CommandBinding(ApplicationCommands.Paste, async (_, __) => await LoadClipboardImageAsync(), (_, e) => e.CanExecute = true));
        InputBindings.Add(new KeyBinding(ApplicationCommands.Paste, new KeyGesture(Key.V, ModifierKeys.Control)));
    }

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        try
        {
            await WebView.EnsureCoreWebView2Async();
            WebView.NavigationCompleted += OnNavigationCompleted;

            var indexPath = Path.Combine(AppContext.BaseDirectory, "wwwroot", "index.html");
            if (File.Exists(indexPath))
            {
                WebView.CoreWebView2.Navigate(new Uri(indexPath).AbsoluteUri);
            }
            else
            {
                MessageBox.Show(this, "index.html não encontrado no diretório wwwroot.", "Snip & Snatch", MessageBoxButton.OK, MessageBoxImage.Error);
            }

            await TryLoadInitialArgumentAsync();
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, $"Falha ao inicializar o WebView2: {ex.Message}", "Snip & Snatch", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private async void OnNavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
    {
        if (!e.IsSuccess)
        {
            MessageBox.Show(this, $"Falha ao carregar a UI: {e.WebErrorStatus}", "Snip & Snatch", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        _webReady = true;
        WebView.NavigationCompleted -= OnNavigationCompleted;

        if (_pendingDataUrl is not null)
        {
            var pending = _pendingDataUrl;
            _pendingDataUrl = null;
            await PushImageToCanvasAsync(pending);
        }
    }

    private async Task TryLoadInitialArgumentAsync()
    {
        var args = Environment.GetCommandLineArgs();
        if (args.Length <= 1)
        {
            return;
        }

        foreach (var candidate in args.Skip(1))
        {
            if (!File.Exists(candidate))
            {
                continue;
            }

            var dataUrl = await GetDataUrlFromFileAsync(candidate);
            await PushOrQueueAsync(dataUrl);
            break;
        }
    }

    private async Task PushOrQueueAsync(string dataUrl)
    {
        if (_webReady && WebView.CoreWebView2 is not null)
        {
            await PushImageToCanvasAsync(dataUrl);
        }
        else
        {
            _pendingDataUrl = dataUrl;
        }
    }

    private async Task PushImageToCanvasAsync(string dataUrl)
    {
        if (WebView.CoreWebView2 is null)
        {
            _pendingDataUrl = dataUrl;
            return;
        }

        var payload = JsonSerializer.Serialize(dataUrl);
        await WebView.CoreWebView2.ExecuteScriptAsync($@"(function(){{const src={payload};
  if(window.loadImage){{ window.loadImage(src); }}
  else if(window.SnipAndSnatch && window.SnipAndSnatch.loadImage){{ window.SnipAndSnatch.loadImage(src); }}
  else {{ window.__snipPending = src; }}
}})();");
    }

    private static async Task<string> GetDataUrlFromFileAsync(string path)
    {
        var bytes = await File.ReadAllBytesAsync(path);
        var mime = GetMimeType(path);
        return $"data:{mime};base64,{Convert.ToBase64String(bytes)}";
    }

    private static string GetMimeType(string path)
    {
        var ext = Path.GetExtension(path).ToLowerInvariant();
        return ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".bmp" => "image/bmp",
            ".tif" or ".tiff" => "image/tiff",
            ".webp" => "image/webp",
            ".heic" => "image/heic",
            _ => "image/png"
        };
    }

    private async Task LoadClipboardImageAsync()
    {
        try
        {
            if (!Clipboard.ContainsImage())
            {
                MessageBox.Show(this, "Nenhuma imagem encontrada no clipboard.", "Snip & Snatch", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            var image = Clipboard.GetImage();
            if (image is null)
            {
                MessageBox.Show(this, "Não foi possível ler a imagem do clipboard.", "Snip & Snatch", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            using var stream = new MemoryStream();
            var encoder = new PngBitmapEncoder();
            encoder.Frames.Add(BitmapFrame.Create(image));
            encoder.Save(stream);
            var bytes = stream.ToArray();
            var dataUrl = $"data:image/png;base64,{Convert.ToBase64String(bytes)}";
            await PushOrQueueAsync(dataUrl);
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, $"Erro ao acessar o clipboard: {ex.Message}", "Snip & Snatch", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private async void OnOpenImage(object sender, RoutedEventArgs e)
    {
        var dialog = new OpenFileDialog
        {
            Filter = "Imagens|*.png;*.jpg;*.jpeg;*.gif;*.bmp;*.tif;*.tiff;*.webp;*.heic|Todos os arquivos|*.*"
        };

        if (dialog.ShowDialog(this) == true)
        {
            var dataUrl = await GetDataUrlFromFileAsync(dialog.FileName);
            await PushOrQueueAsync(dataUrl);
        }
    }

    private async void OnPasteImage(object sender, RoutedEventArgs e)
    {
        await LoadClipboardImageAsync();
    }

    private void OnReload(object sender, RoutedEventArgs e)
    {
        if (WebView.CoreWebView2 is null)
        {
            return;
        }

        _webReady = false;
        WebView.NavigationCompleted += OnNavigationCompleted;
        WebView.Reload();
    }

    private void OnPreviewDragOver(object sender, DragEventArgs e)
    {
        if (e.Data.GetDataPresent(DataFormats.FileDrop))
        {
            var files = (string[]?)e.Data.GetData(DataFormats.FileDrop);
            if (files?.Any(IsSupportedImage) == true)
            {
                e.Effects = DragDropEffects.Copy;
                e.Handled = true;
                return;
            }
        }

        e.Effects = DragDropEffects.None;
        e.Handled = true;
    }

    private async void OnDrop(object sender, DragEventArgs e)
    {
        if (!e.Data.GetDataPresent(DataFormats.FileDrop))
        {
            return;
        }

        var files = (string[]?)e.Data.GetData(DataFormats.FileDrop);
        var candidate = files?.FirstOrDefault(IsSupportedImage);
        if (candidate is null)
        {
            return;
        }

        var dataUrl = await GetDataUrlFromFileAsync(candidate);
        await PushOrQueueAsync(dataUrl);
    }

    private static bool IsSupportedImage(string path)
    {
        var ext = Path.GetExtension(path).ToLowerInvariant();
        return ext is ".png" or ".jpg" or ".jpeg" or ".gif" or ".bmp" or ".tif" or ".tiff" or ".webp" or ".heic";
    }
}
