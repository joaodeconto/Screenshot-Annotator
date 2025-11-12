using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml;

namespace SnipSnatch.Views;

public sealed partial class EditorPage : Page
{
    // Add this property to reference the CanvasHost element
    public Panel CanvasHost { get; set; }

    public EditorPage()
    {
        this.InitializeComponent();
        Loaded += OnLoaded;

        // Initialize CanvasHost if not set by XAML
        if (CanvasHost == null)
        {
            CanvasHost = new Grid();
            this.Content = CanvasHost;
        }
    }

    private void OnLoaded(object sender, RoutedEventArgs e)
    {
        // Placeholder until renderer is wired: show neutral surface
        CanvasHost.Children[0] = new Grid();
    }
}
