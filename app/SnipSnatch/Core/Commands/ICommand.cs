namespace SnipSnatch.Core.Commands;

public interface ICommand
{
    void Do();
    void Undo();
}

