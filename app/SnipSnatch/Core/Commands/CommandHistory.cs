namespace SnipSnatch.Core.Commands;

public sealed class CommandHistory
{
    private readonly Stack<ICommand> _done = new();
    private readonly Stack<ICommand> _undone = new();

    public void Push(ICommand cmd)
    {
        cmd.Do();
        _done.Push(cmd);
        _undone.Clear();
    }

    public bool CanUndo => _done.Count > 0;
    public bool CanRedo => _undone.Count > 0;

    public void Undo()
    {
        if (!CanUndo) return;
        var cmd = _done.Pop();
        cmd.Undo();
        _undone.Push(cmd);
    }

    public void Redo()
    {
        if (!CanRedo) return;
        var cmd = _undone.Pop();
        cmd.Do();
        _done.Push(cmd);
    }
}

