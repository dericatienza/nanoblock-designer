import { EditorMode } from '../editor-mode';
import { EditorComponent, RotateDirection } from '../editor.component';
import { Cell } from '../../objects/grid.directive';
import { BuildCommand } from '../commands/build-command';

const KEY_ROTATE_RIGHT = 69;
const KEY_ROTATE_LEFT = 81;

export class BuildEditorMode extends EditorMode {

    validCell: Cell;

    constructor(editor: EditorComponent) {
        super(editor);

        this.onKeyDown = this.onKeyDown.bind(this);
    }

    highlight(cell: Cell) {
        this.validCell = this.editor.getValidCell(this.editor.currentBrickObject, cell);

        if (this.validCell) {
            this.editor.currentBrickObject.object.position.set
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

        this.editor.currentBrickObject.object.position.set(1000, 1000, 1000);

        this.editor.setCurrentBrickOpacity();

        this.addListeners();

        this.editor.renderer.canvas.focus();
    }

    addListeners() {
        this.editor.renderer.canvas.addEventListener('keydown', this.onKeyDown);
    }

    removeListeners() {
        this.editor.renderer.canvas.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KEY_ROTATE_RIGHT) {
            this.editor.rotateBrickObject(this.editor.currentBrickObject, RotateDirection.Right);
        } else if (event.keyCode === KEY_ROTATE_LEFT) {
            this.editor.rotateBrickObject(this.editor.currentBrickObject, RotateDirection.Left);
        }

        this.editor.gridSelector.refreshHighlight();
    }

    exit() {
        this.editor.destroyCurrentBrickObject();

        this.removeListeners();
    }

    nextBrick(cell: Cell) {
        // Temp color test
        this.editor.currentBrickColor = this.editor.brickColors[Math.floor(Math.random() * this.editor.brickColors.length)];

        this.editor.createCurrentBrickObject();
        this.editor.setCurrentBrickOpacity();

        this.validCell = this.editor.getValidCell(this.editor.currentBrickObject, cell);

        this.editor.currentBrickObject.object.position.set
            (this.validCell.worldPosition.x, this.validCell.worldPosition.y, this.validCell.worldPosition.z);
    }

    buildBrick(cell: Cell) {
        this.editor.resetCurrentBrickOpacity();

        const command = new BuildCommand(this.editor.currentBrickObject, cell);
        this.editor.executeCommand(command);
    }
}
