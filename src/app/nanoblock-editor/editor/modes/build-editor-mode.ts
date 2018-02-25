import { EditorMode } from '../editor-mode';
import { EditorComponent } from '../editor.component';
import { Cell } from '../../objects/grid.directive';
import { BuildCommand } from '../commands/build-command';

export class BuildEditorMode extends EditorMode {

    highlight(cell: Cell) {
        this.editor.currentBrickObject.mesh.position.set(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);
    }
    select(cell: Cell) {
        this.buildBrick(cell);
        this.nextBrick(cell);
    }
    enter() {
        this.editor.setCurrentBrickOpacity();
    }
    exit() {
        console.log('Exited build mode.');
    }

    nextBrick(cell: Cell) {
        this.editor.createCurrentBrick();
        this.editor.setCurrentBrickOpacity();
        this.editor.currentBrickObject.mesh.position.set(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);
    }

    buildBrick(cell: Cell) {
        const command = new BuildCommand(cell);
        this.editor.executeCommand(command);

        this.editor.resetCurrentBrickOpacity();
    }
}
