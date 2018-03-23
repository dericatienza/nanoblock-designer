import { EditorMode } from '../editor-mode';
import { EditorComponent, RotateDirection } from '../editor.component';
import { Cell } from '../../objects/grid.directive';
import { BuildCommand } from '../commands/build-command';
import { Vector3 } from 'three';
import THREE = require('three');
import { MoveCommand } from '../commands/move-command';
import { EraseCommand } from '../commands/erase-command';
import { RemoveCommand } from '../commands/remove-command';
import { ChainCommand } from '../commands/chain-command';

const KEY_ROTATE_RIGHT = 69;
const KEY_ROTATE_LEFT = 81;

const KEY_PIVOT_MOVE_UP = 87;
const KEY_PIVOT_MOVE_DOWN = 83;
const KEY_PIVOT_MOVE_RIGHT = 65;
const KEY_PIVOT_MOVE_LEFT = 68;

export class BuildEditorMode extends EditorMode {
    cameraDirection: Vector3 = new Vector3();

    removeCommand: RemoveCommand;
    isMoving = false;
    oldCell: Cell;

    constructor(editor: EditorComponent) {
        super(editor);
        this.name = 'build';

        this.onKeyDown = this.onKeyDown.bind(this);
    }

    highlight(cell: Cell) {
        const validCell = this.editor.getValidCell(this.editor.currentBrickObject, cell);

        if (validCell) {
            this.editor.currentBrickObject.position.set
                (validCell.worldPosition.x, validCell.worldPosition.y, validCell.worldPosition.z);
        }
    }

    select(cell: Cell) {
        const validCell = this.editor.getValidCell(this.editor.currentBrickObject, cell);

        if (validCell) {
            this.nextBrick(validCell);

            this.editor.gridSelector.forceHighlightOnMouse();
        }
    }

    enter() {
        if (this.editor.currentBrickObject) {
            this.oldCell = this.editor.currentBrickObject.cell;

            this.removeCommand = new RemoveCommand(this.editor.currentBrickObject);

            this.editor.executeCommand(this.removeCommand);

            this.isMoving = true;

        } else {
            this.editor.createCurrentBrickObject();

            this.editor.currentBrickObject.position.set(1000, 1000, 1000);

            this.isMoving = false;
        }

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
        // Rotate input
        if (event.keyCode === KEY_ROTATE_RIGHT) {
            this.editor.currentBrickObject.rotationY += 90;
        } else if (event.keyCode === KEY_ROTATE_LEFT) {
            this.editor.currentBrickObject.rotationY -= 90;
        }

        // Pivot input
        if (event.keyCode === KEY_PIVOT_MOVE_UP) {
            this.editor.currentBrickObject.brickPivotZ -= 1;
        } else if (event.keyCode === KEY_PIVOT_MOVE_DOWN) {
            this.editor.currentBrickObject.brickPivotZ += 1;
        } else if (event.keyCode === KEY_PIVOT_MOVE_RIGHT) {
            this.editor.currentBrickObject.brickPivotX -= 1;
        } else if (event.keyCode === KEY_PIVOT_MOVE_LEFT) {
            this.editor.currentBrickObject.brickPivotX += 1;
        }

        this.editor.gridSelector.forceHighlightOnMouse();
    }

    exit() {
        this.editor.destroyCurrentBrickObject();

        this.removeListeners();
    }

    nextBrick(cell: Cell) {
        const pivotX = this.editor.currentBrickObject.brickPivotX;
        const pivotZ = this.editor.currentBrickObject.brickPivotZ;

        const rotationY = this.editor.currentBrickObject.rotationY;

        this.editor.refreshCurrentBrickColor();

        const buildCommand = new BuildCommand(this.editor.currentBrickObject, cell);

        this.editor.destroyCurrentBrickObject();

        this.editor.executeCommand(buildCommand);

        if (this.isMoving) {
            const chainCommand = new ChainCommand(this.removeCommand, buildCommand);

            this.editor.commandHistory.splice(this.editor.commandHistory.indexOf(this.removeCommand), 2);
            this.editor.commandHistory.push(chainCommand);

            this.editor.commandHistoryIndex = this.editor.commandHistory.length - 1;

            this.editor.setMode('select');
        } else {
            this.editor.createCurrentBrickObject();
            this.editor.setCurrentBrickOpacity();

            this.editor.currentBrickObject.brickPivotZ = pivotZ;
            this.editor.currentBrickObject.brickPivotX = pivotX;

            this.editor.currentBrickObject.rotationY = rotationY;
        }
    }
}
