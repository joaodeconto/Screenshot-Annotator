using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;

namespace SnipSnatch;

public sealed partial class MainWindow : Window
{
    public MainWindow()
    {
        this.InitializeComponent();
        Title = "Snip & Snatch";
        ExtendsContentIntoTitleBar = false;
    }
}

