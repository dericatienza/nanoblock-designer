import { Command } from '../command';
import { EditorComponent } from '../editor.component';

export class ChainCommand extends Command {
    commands: Command[];

    constructor(...commands: Command[]) {
        super();

        this.commands = commands;
    }

    do(editor: EditorComponent) {
        this.commands.forEach(x => x.do(editor));
    }
    undo(editor: EditorComponent) {
        const commandsReversed = this.commands.slice().reverse();

        commandsReversed.forEach(x => x.undo(editor));
    }
}
