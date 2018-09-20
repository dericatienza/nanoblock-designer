import { Design, Brick, BrickType, BrickColor } from './editor.models';
import { BrickTypeService } from '../brick-type.service';
import { BrickColorService } from '../brick-color.service';
import { BrickObject } from './brick-object';
import * as three from 'three';
import { PivotObject3D } from './pivot-object';
import { CELL_SIZE } from '../objects/grid.directive';
import { Scene, Renderer, Camera, MeshPhongMaterial, WebGLRenderer, Vector2, Vector3 } from 'three';
import * as mergeImg from 'merge-img';
import Jimp = require('jimp');
import tinycolor = require('tinycolor2');

declare var THREE: any;

export const INSTRUCTIONS_BRICK_OUTLINE_MATERIAL = new three.LineBasicMaterial({
    color: 'black',
    linewidth: 1,
    opacity: 1
});

export class InstructionsGenerator {
    onGenerated: (imageUrl: string) => void;

    private brickLevels: Brick[][];

    private instructionBricks: InstructionBrick[];

    brickPanelRows = 5;

    instructionPanelColumns = 9;

    padding = 15;

    imageWidth = 2480; // 72 DPI: 595;
    imageHeight = 3508; // 72 DPI: 842;

    rendererClearColor = '#d3d3d3';

    textFontName = 'Arial';
    textFontSize = 16;

    constructor(public design: Design,
        public brickTypeService: BrickTypeService,
        public brickColorService: BrickColorService) {
    }

    generate() {
        console.log(this.design.colors);

        this.brickTypeService.getBrickTypes()
            .subscribe((brickTypes: BrickType[]) => {
                this.setupBrickObjects(brickTypes);
                this.setupBrickLevels();

                this.internalGenerate();
            });
    }

    private internalGenerate() {
        const renderer = new three.WebGLRenderer({
            antialias: true,
            alpha: true
            // preserveDrawingBuffer: true
        });

        renderer.setPixelRatio(devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(this.rendererClearColor, 0);

        const canvas = renderer.domElement;
        canvas.style.display = 'none';

        document.body.appendChild(renderer.domElement);

        const scene = new three.Scene();

        const ambientLight = new three.AmbientLight('white');
        const pointLight1 = new three.PointLight('white', 1, 1000);
        pointLight1.position.set(40, 80, 80);
        const pointLight2 = new three.PointLight('white', 1, 1000);
        pointLight1.position.set(-40, 80, -80);

        scene.add(ambientLight, pointLight1, pointLight2);

        const imageCanvas = document.createElement('canvas');

        imageCanvas.width = this.imageWidth;
        imageCanvas.height = this.imageHeight;
        imageCanvas.style.display = 'none';

        document.body.appendChild(imageCanvas);

        const imageContext = imageCanvas.getContext('2d');

        imageContext.font = `${this.textFontSize}px ${this.textFontName}`;

        // Generate bricks panel
        const bricksPanelSize = this.generateBricksPanel(renderer, scene, imageContext);

        // Generate instructions panel
        this.generateInstructionsPanel(renderer, scene, imageContext, bricksPanelSize);

        document.body.removeChild(canvas);
        document.body.removeChild(imageCanvas);

        setTimeout(() => {
            this.onGenerated(imageCanvas.toDataURL());
        }, 0);
    }

    generateInstructionsPanel(renderer: WebGLRenderer, scene: Scene, imageContext: CanvasRenderingContext2D, offset: Vector2) {
        const panelWidth = this.imageWidth / this.instructionPanelColumns - this.padding;
        const panelHeight = offset.y;

        const fullPanelWidth = panelWidth + this.padding;
        const fullPanelHeight = panelHeight + this.padding * 2;

        // Accounting for bricks panel on first row
        const topRowPanelCount = Math.floor((this.imageWidth - offset.x) / fullPanelWidth);

        const excessWidth = (this.imageWidth - offset.x) - topRowPanelCount * fullPanelWidth;

        const topRowPanelWidth = fullPanelWidth + (excessWidth / topRowPanelCount);

        renderer.setSize(topRowPanelWidth - this.padding, panelHeight);

        let panelAspectRatio = (topRowPanelWidth - this.padding) / panelHeight;

        const cameraSize = 60;

        const camera = new three.OrthographicCamera(
            -cameraSize * panelAspectRatio,
            cameraSize * panelAspectRatio,
            cameraSize,
            -cameraSize,
            1,
            1000);

        camera.position.set(cameraSize, cameraSize, cameraSize);

        camera.lookAt(0, 0, 0);

        camera.zoom = 1.5;
        camera.updateProjectionMatrix();

        let builtBrickObjectClones: PivotObject3D[] = [];

        const startX = -(this.design.size / 2) + CELL_SIZE.x / 2;
        const startZ = -(this.design.size / 2) + CELL_SIZE.z / 2;
        const startY = 0;

        for (let x = 0; x < this.brickLevels.length && x < topRowPanelCount; x++) {
            const brickLevelBricks = this.brickLevels[x];

            builtBrickObjectClones.push(...this.buildBrickLevelObjects(brickLevelBricks,
                scene, startX, startY, startZ));

            const imageDataUrl = this.snapScene(renderer, scene, camera);

            const image = new Image();
            image.src = imageDataUrl;
            const dx = x;

            image.onload = () => {
                imageContext.drawImage(image,
                    this.padding + offset.x + dx * topRowPanelWidth,
                    0);
            };

            imageContext.strokeRect(this.padding + offset.x + x * topRowPanelWidth, 0, topRowPanelWidth - this.padding, panelHeight);

            this.setBrickObjectsBuiltColor(brickLevelBricks, builtBrickObjectClones);

            builtBrickObjectClones = [];
        }

        // Equal width panels after first row
        panelAspectRatio = panelWidth / panelHeight;

        renderer.setSize(panelWidth, panelHeight);

        const rows = Math.ceil((this.brickLevels.length - topRowPanelCount) / this.instructionPanelColumns);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < this.instructionPanelColumns
                && y * x + x + topRowPanelCount < this.brickLevels.length
                ; x++) {
                const brickLevelBricks = this.brickLevels[y * x + x + topRowPanelCount];

                builtBrickObjectClones.push(...this.buildBrickLevelObjects(brickLevelBricks,
                    scene, startX, startY, startZ));

                const imageDataUrl = this.snapScene(renderer, scene, camera);

                const image = new Image();
                image.src = imageDataUrl;
                const dx = x;
                const dy = y + 1; // Skip first row

                image.onload = () => {
                    imageContext.drawImage(image,
                        dx * fullPanelWidth,
                        dy * fullPanelHeight);
                };

                imageContext.strokeRect(dx * fullPanelWidth, dy * fullPanelHeight, panelWidth, panelHeight);

                this.setBrickObjectsBuiltColor(brickLevelBricks, builtBrickObjectClones);

                builtBrickObjectClones = [];
            }
        }
    }

    buildBrickLevelObjects(brickLevelBricks: Brick[], scene: Scene,
        startX: number, startY: number,
        startZ: number): PivotObject3D[] {

        const builtBrickObjects: PivotObject3D[] = [];

        for (const brick of brickLevelBricks) {
            const instructionBrick = this.instructionBricks
                .find(ib => ib.type.id === brick.typeId && ib.color.id === brick.colorId);

            const brickObjectClone = this.getBrickObjectClone(brick, instructionBrick,
                startX, startY, startZ);

            scene.add(brickObjectClone);

            builtBrickObjects.push(brickObjectClone);
        }

        return builtBrickObjects;
    }

    setBrickObjectsBuiltColor(bricks: Brick[], builtBrickObjects: PivotObject3D[]) {
        if (bricks.length !== builtBrickObjects.length) {
            throw new Error('Bricks number must equal built brick objects');
        }

        for (let x = 0; x < bricks.length; x++) {
            const brick = bricks[x];
            const builtBrickObject = builtBrickObjects[x];

            const instructionBrick = this.instructionBricks.find(
                ib => ib.type.id === brick.typeId && ib.color.id === brick.colorId);

            const builtBrickColorMaterial = this.brickColorService.getBrickColorMaterial(instructionBrick.builtColor);

            const mesh = <three.Mesh>builtBrickObject.pivot.children[0].children[0]; // Investigate why pivot has extra child
            mesh.material = builtBrickColorMaterial;
        }
    }

    getBrickObjectClone(brick: Brick, instructionBrick: InstructionBrick,
        startX: number, startY: number, startZ: number): PivotObject3D {
        const brickObjectClone = instructionBrick.brickObject.clone();

        const positionX = startX + (CELL_SIZE.x * brick.x);
        const positionY = startY + (CELL_SIZE.y * brick.y);
        const positionZ = startZ + (CELL_SIZE.z * brick.z);

        brickObjectClone.position.set(positionX, positionY, positionZ);

        brickObjectClone.pivot.position.setX(-CELL_SIZE.x * brick.pivotX);
        brickObjectClone.pivot.position.setZ(-CELL_SIZE.z * brick.pivotZ);

        const radiansY = three.Math.degToRad(brick.rotationY);

        brickObjectClone.setRotationFromAxisAngle(new Vector3(0, 1, 0), radiansY);

        return brickObjectClone;
    }

    generateBricksPanel(renderer: WebGLRenderer, scene: Scene, imageContext: CanvasRenderingContext2D): Vector2 {
        const panelWidth = 45;
        const panelHeight = 45;

        const maxBrickTypeSize = Math.max(...this.instructionBricks
            .map(ib => ib.type)
            .map(bt => Math.max(bt.width, bt.height, bt.depth)));

        const maxBrickTypeUnitSize = maxBrickTypeSize * CELL_SIZE.x;

        renderer.setSize(panelWidth, panelHeight);

        const panelAspectRatio = panelWidth / panelHeight;

        const cameraSize = 10;

        const camera = new three.OrthographicCamera(
            -cameraSize * panelAspectRatio,
            cameraSize * panelAspectRatio,
            cameraSize,
            -cameraSize,
            1,
            1000);

        camera.position.set(maxBrickTypeUnitSize, maxBrickTypeUnitSize, maxBrickTypeUnitSize);

        camera.lookAt(0, 0, 0);

        const brickCountTextSize = 30;

        const brickImagesDataUrls: string[] = [];

        const studSize = this.brickTypeService.studSize;

        for (const instructionBrick of this.instructionBricks) {
            const brickObjectClone = instructionBrick.brickObject.clone();

            const boundingBoxSize = new three.Box3().setFromObject(brickObjectClone).getSize();

            brickObjectClone.position.set(
                (instructionBrick.type.width - 1) * -studSize.x / 2,
                (instructionBrick.type.height - 1) * -studSize.y / 2,
                (instructionBrick.type.depth - 1) * -studSize.z / 2
            );

            scene.add(brickObjectClone);

            brickImagesDataUrls.push(this.snapScene(renderer, scene, camera));

            scene.remove(brickObjectClone);
        }

        const bricksPanelWidth = Math.ceil(brickImagesDataUrls.length / this.brickPanelRows)
            * (panelWidth + brickCountTextSize);
        const bricksPanelHeight = (brickImagesDataUrls.length < this.brickPanelRows ?
            brickImagesDataUrls.length : this.brickPanelRows) * panelHeight;

        for (let x = 0; x < brickImagesDataUrls.length / this.brickPanelRows; x++) {
            const skip = x * this.brickPanelRows;

            for (let y = 0; y < this.brickPanelRows && skip + y < brickImagesDataUrls.length; y++) {
                const image = new Image();
                image.src = brickImagesDataUrls[skip + y];
                const dx = x;
                const dy = y;

                imageContext.fillText(`x ${this.instructionBricks[skip + y].count}`,
                    panelWidth + (dx * (panelWidth + brickCountTextSize)),
                    dy * panelHeight + panelHeight / 2);

                image.onload = () => {
                    imageContext.drawImage(image,
                        dx * (panelWidth + brickCountTextSize),
                        dy * panelHeight);
                };
            }
        }

        imageContext.strokeRect(0, 0, bricksPanelWidth, bricksPanelHeight);

        return new Vector2(bricksPanelWidth, bricksPanelHeight);
    }

    snapScene(renderer: Renderer, scene: Scene, camera: Camera): string {
        renderer.render(scene, camera);

        return renderer.domElement.toDataURL();
    }

    private setupBrickObjects(allBrickTypes: BrickType[]): any {
        this.instructionBricks = [];

        for (const color of this.design.colors) {
            const brickTypeIds = Array.from(new Set(this.design.bricks
                .filter(b => b.colorId === color.id)
                .map(b => b.typeId)));

            if (brickTypeIds.length > 0) {
                const instructionBricks: InstructionBrick[] = [];

                for (const brickTypeId of brickTypeIds) {
                    const brickType = allBrickTypes.find(bt => bt.id === brickTypeId);

                    const count = this.design.bricks.filter(b => b.typeId === brickTypeId
                        && b.colorId === color.id).length;

                    const brickObject = this.createBrickObject(brickType, color);

                    const builtColor = BrickColor.clone(color);
                    builtColor.id = -builtColor.id;
                    builtColor.colorHex = tinycolor(builtColor.colorHex).lighten(30).toString();

                    instructionBricks.push({
                        type: brickType,
                        color: color,
                        builtColor: builtColor,
                        count: count,
                        brickObject: brickObject
                    });
                }

                instructionBricks.sort((a, b) => {
                    return b.type.width * b.type.depth - a.type.width * a.type.depth;
                });

                this.instructionBricks.push(...instructionBricks);
            }
        }

        console.log(this.instructionBricks);
    }

    private createBrickObject(type: BrickType, color: BrickColor): PivotObject3D {
        const geometry = this.brickTypeService.getBrickTypeGeometry(type);

        const material = this.brickColorService.getBrickColorMaterial(color);

        const brickObject = new PivotObject3D();
        const mesh = new THREE.Mesh(geometry, material);

        const outlinesGeometry = new THREE.OutlinesGeometry(geometry, 45);
        const outline = new THREE.LineSegments(outlinesGeometry, INSTRUCTIONS_BRICK_OUTLINE_MATERIAL);
        mesh.add(outline);

        brickObject.add(mesh);

        return brickObject;
    }

    private setupBrickLevels() {
        this.brickLevels = [];

        const designHeight = Math.max(...this.design.bricks.map(b => b.y)) + 1;

        for (let x = 0; x < designHeight; x++) {
            this.brickLevels[x] = this.design.bricks.filter(b => b.y === x);
        }
    }
}

export class InstructionBrick {
    type: BrickType;
    color: BrickColor;
    builtColor: BrickColor;
    count: number;
    brickObject: PivotObject3D;
}
