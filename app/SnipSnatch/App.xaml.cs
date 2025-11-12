using Microsoft.UI.Xaml;

namespace SnipSnatch;

public partial class App : Application
{
    private Window? _window;

    public App()
    {
        // Remove InitializeComponent(); as it does not exist for App.xaml.cs in WinUI 3
    }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        _window = new MainWindow();
        _window.Activate();
    }
}

