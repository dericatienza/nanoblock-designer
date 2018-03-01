import { EditorMode } from '../editor-mode';
import { EditorComponent } from '../editor.component';
import { Cell } from '../../objects/grid.directive';
import { BuildCommand } from '../commands/build-command';

export class BuildEditorMode extends EditorMode {
    validCell: Cell;

    highlight(cell: Cell) {
        this.validCell = this.editor.getValidCell(this.editor.currentBrickObject, cell);

        if (this.validCell) {
            this.editor.currentBrickObject.mesh.position.set
                (this.validCell.worldPosition.x, this.validCell.worldPosition.y, this.validCell.worldPosition.z);
        }
    }

    select(cell: Cell) {
        if (this.validCell) {
            this.buildBrick(this.validCell);
            this.nextBrick(this.validCell);
        } else {
            alert('Cells already occupied.');
        }
    }

    enter() {
        this.editor.createCurrentBrickObject();

        this.editor.currentBrickObject.mesh.position.set(1000, 1000, 1000);

        this.editor.setCurrentBrickOpacity();
    }

    exit() {
        this.editor.destroyCurrentBrickObject();
    }

    nextBrick(cell: Cell) {
        // Temp color test
        this.editor.currentBrickColor = this.editor.brickColors[Math.floor(Math.random() * this.editor.brickColors.length)];

        this.editor.createCurrentBrickObject();
        this.editor.setCurrentBrickOpacity();

        this.validCell = this.editor.getValidCell(this.editor.currentBrickObject, cell);

        this.editor.currentBrickObject.mesh.position.set
            (this.validCell.worldPosition.x, this.validCell.worldPosition.y, this.validCell.worldPosition.z);
    }

    buildBrick(cell: Cell) {
        this.editor.resetCurrentBrickOpacity();

        const command = new BuildCommand(this.editor.currentBrickObject, cell);
        this.editor.executeCommand(command);
    }
}
