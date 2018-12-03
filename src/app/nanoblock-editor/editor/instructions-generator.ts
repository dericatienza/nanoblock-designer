import { Design, Brick, BrickType, BrickColor } from './editor.models';
import { BrickTypeService } from '../brick-type.service';
import { BrickColorService } from '../brick-color.service';
import { BrickObject } from './brick-object';
import * as three from 'three';
import { PivotObject3D } from './pivot-object';
import { CELL_SIZE, Cell } from '../objects/grid.directive';
import { Scene, Renderer, Camera, MeshPhongMaterial, WebGLRenderer, Vector2, Vector3 } from 'three';
import * as mergeImg from 'merge-img';
import * as tinycolor from 'tinycolor2';
import { EditorComponent } from './editor.component';

declare var THREE: any;

export const INSTRUCTIONS_LIGHT_BRICK_OUTLINE_MATERIAL = new three.LineBasicMaterial({
    color: 'black',
    linewidth: 1,
    opacity: 1
});

export const INSTRUCTIONS_BUILT_LIGHT_BRICK_OUTLINE_MATERIAL = new three.LineBasicMaterial({
    color: 'black',
    linewidth: 1,
    opacity: 0.5
});

export const INSTRUCTIONS_DARK_BRICK_OUTLINE_MATERIAL = new three.LineBasicMaterial({
    color: 'lightgray',
    linewidth: 1,
    opacity: 1
});

export const INSTRUCTIONS_BUILT_DARK_BRICK_OUTLINE_MATERIAL = new three.LineBasicMaterial({
    color: 'lightgray',
    linewidth: 1,
    opacity: 0.5
});

export class InstructionsGenerator {
    onGenerated: (imageUrl: string) => void;

    private brickLevels: InstructionBrickLevel[];

    private instructionBricks: InstructionBrick[];

    brickPanelRows = 6;

    instructionPanelColumns = 4;

    padding = 15;

    imageWidth = 2480; // 72 DPI: 595;
    // imageHeight = 3508; // 72 DPI: 842;

    rendererClearColor = '#d3d3d3';

    textFontName = 'Arial';
    textFontSize = 16;

    brickPanelWidth = 80;
    brickPanelHeight = 80;

    brickCountTextSize = 30;

    brickTypes: BrickType[];

    constructor(public design: Design,
        public brickTypeService: BrickTypeService,
        public brickColorService: BrickColorService) {
    }

    generate() {
        this.brickTypeService.getBrickTypes()
            .subscribe((brickTypes: BrickType[]) => {
                this.brickTypes = brickTypes;

                this.setupBrickObjects();
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

        const bricksPanelWidth = this.imageWidth / this.instructionPanelColumns - this.padding;
        const bricksPanelHeight = (this.instructionBricks.length < this.brickPanelRows ?
            this.instructionBricks.length : this.brickPanelRows) * this.brickPanelHeight;

        const fullPanelWidth = bricksPanelWidth + this.padding;
        const fullPanelHeight = bricksPanelHeight + this.padding * 2;

        const topRowPanelCount = Math.floor((this.imageWidth - bricksPanelWidth) / fullPanelWidth);
        const instructionBricksRows = Math.ceil((this.brickLevels.length - topRowPanelCount) / this.instructionPanelColumns);

        const imageHeight = fullPanelHeight * (instructionBricksRows + 1) - this.padding * 2;

        imageCanvas.width = this.imageWidth;
        imageCanvas.height = imageHeight;
        imageCanvas.style.display = 'none';

        document.body.appendChild(imageCanvas);

        const imageContext = imageCanvas.getContext('2d');

        imageContext.rect(0, 0, this.imageWidth, imageHeight);
        imageContext.fillStyle = 'white';
        imageContext.fill();

        imageContext.fillStyle = 'black';

        imageContext.font = `${this.textFontSize}px ${this.textFontName}`;

        // Generate bricks panel
        const bricksPanelSize = this.generateBricksPanel(renderer, scene, imageContext);

        // Generate instructions panel
        this.generateInstructionsPanel(renderer, scene, imageContext, bricksPanelSize);

        document.body.removeChild(canvas);
        document.body.removeChild(imageCanvas);

        setTimeout(() => {
            this.onGenerated(imageCanvas.toDataURL());

            renderer.forceContextLoss();
            renderer.context = null;
            renderer.domElement = null;
        }, 0);
    }

    getBrickLevelSize(brickLevelBricks: Brick[]): number {
        const minX = Math.min(...brickLevelBricks
            .map(b => b.x));

        const maxX = Math.max(...brickLevelBricks
            .map(b => b.x));

        const minZ = Math.min(...brickLevelBricks
            .map(b => b.z));

        const maxZ = Math.max(...brickLevelBricks
            .map(b => b.z));

        const brickLevelSize = Math.max(maxX - minX, maxZ - minZ) + 1;

        return brickLevelSize;
    }

    getBrickLevelCenter(brickLevelBricks: Brick[]): Vector3 {
        const minX = Math.min(...brickLevelBricks
            .map(b => b.x));

        const maxX = Math.max(...brickLevelBricks
            .map(b => b.x));

        const minY = Math.min(...brickLevelBricks
            .map(b => b.y));

        const maxY = Math.max(...brickLevelBricks
            .map(b => b.y));

        const minZ = Math.min(...brickLevelBricks
            .map(b => b.z));

        const maxZ = Math.max(...brickLevelBricks
            .map(b => b.z));

        const center = new Vector3(
            (minX + ((maxX - minX) / 2)) * CELL_SIZE.x,
            (minY + ((maxY - minY) / 2)) * CELL_SIZE.y,
            (minZ + ((maxZ - minZ) / 2)) * CELL_SIZE.z,
        );

        return center;
    }

    generateInstructionsPanel(renderer: WebGLRenderer, scene: Scene,
        imageContext: CanvasRenderingContext2D, offset: Vector2) {
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

        const maxBrickLevelSize = (Math.max(...this.brickLevels.map(bl => this.getBrickLevelSize(bl.bricks))) + 2) * CELL_SIZE.x;

        camera.zoom = (cameraSize * 2) / maxBrickLevelSize;
        camera.updateProjectionMatrix();

        let builtBrickObjectClones: PivotObject3D[] = [];

        const startX = -(this.design.size / 2) + CELL_SIZE.x / 2;
        const startZ = -(this.design.size / 2) + CELL_SIZE.z / 2;
        const startY = 0;

        for (let x = 0; x < this.brickLevels.length && x < topRowPanelCount; x++) {
            const brickLevel = this.brickLevels[x];

            const brickLevelBricks = brickLevel.bricks;

            builtBrickObjectClones.push(...this.buildBrickLevelObjects(brickLevelBricks,
                scene, startX, startY, startZ));

            const brickLevelCenter = this.getBrickLevelCenter(brickLevelBricks);

            camera.position.set(brickLevelCenter.x + (cameraSize * (brickLevel.isRightView ? 1 : -1)),
                brickLevelCenter.y + (cameraSize * (brickLevel.isTopView ? 1 : -1)),
                brickLevelCenter.z + (cameraSize * (brickLevel.isFrontView ? 1 : -1)));

            camera.lookAt(brickLevelCenter);

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
        renderer.setSize(panelWidth, panelHeight);

        panelAspectRatio = panelWidth / panelHeight;

        camera.left = -cameraSize * panelAspectRatio;
        camera.right = cameraSize * panelAspectRatio;
        camera.top = cameraSize;
        camera.bottom = -cameraSize;

        camera.updateProjectionMatrix();

        const rows = Math.ceil((this.brickLevels.length - topRowPanelCount) / this.instructionPanelColumns);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < this.instructionPanelColumns
                && y * this.instructionPanelColumns + x + topRowPanelCount < this.brickLevels.length
                ; x++) {
                const brickLevelIndex = (y * this.instructionPanelColumns) + x + topRowPanelCount;

                const brickLevel = this.brickLevels[brickLevelIndex];

                const brickLevelBricks = brickLevel.bricks;

                builtBrickObjectClones.push(...this.buildBrickLevelObjects(brickLevelBricks,
                    scene, startX, startY, startZ));

                const brickLevelCenter = this.getBrickLevelCenter(brickLevelBricks);

                camera.position.set(brickLevelCenter.x + (cameraSize * (brickLevel.isRightView ? 1 : -1)),
                    brickLevelCenter.y + (cameraSize * (brickLevel.isTopView ? 1 : -1)),
                    brickLevelCenter.z + (cameraSize * (brickLevel.isFrontView ? 1 : -1)));

                camera.lookAt(brickLevelCenter);

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

            const outline = <three.LineSegments>mesh.children[0];

            const outlineMaterial = tinycolor(instructionBrick.color.colorHex).getLuminance() > 0.1 ?
                INSTRUCTIONS_BUILT_LIGHT_BRICK_OUTLINE_MATERIAL :
                INSTRUCTIONS_BUILT_DARK_BRICK_OUTLINE_MATERIAL;

            outline.material = outlineMaterial;
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

        const maxBrickTypeSize = Math.max(...this.instructionBricks
            .map(ib => ib.type)
            .map(bt => Math.max(bt.width, bt.height, bt.depth)));

        const maxBrickTypeUnitSize = maxBrickTypeSize * CELL_SIZE.x;

        renderer.setSize(this.brickPanelWidth, this.brickPanelHeight);

        const panelAspectRatio = this.brickPanelWidth / this.brickPanelHeight;

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

        const brickImagesDataUrls: string[] = [];

        const studSize = this.brickTypeService.studSize;

        for (const instructionBrick of this.instructionBricks) {
            const brickObjectClone = instructionBrick.brickObject.clone();

            // const outline = <three.LineSegments>brickObjectClone.pivot.children[0].children[0].children[0];
            // outline.material = INSTRUCTIONS_LIGHT_BRICK_OUTLINE_MATERIAL;

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
            * (this.brickPanelWidth + this.brickCountTextSize);
        const bricksPanelHeight = (brickImagesDataUrls.length < this.brickPanelRows ?
            brickImagesDataUrls.length : this.brickPanelRows) * this.brickPanelHeight;

        for (let x = 0; x < brickImagesDataUrls.length / this.brickPanelRows; x++) {
            const skip = x * this.brickPanelRows;

            for (let y = 0; y < this.brickPanelRows && skip + y < brickImagesDataUrls.length; y++) {
                const image = new Image();
                image.src = brickImagesDataUrls[skip + y];
                const dx = x;
                const dy = y;

                imageContext.fillText(`x ${this.instructionBricks[skip + y].count}`,
                    this.brickPanelWidth + (dx * (this.brickPanelWidth + this.brickCountTextSize)),
                    dy * this.brickPanelHeight + this.brickPanelHeight / 2);

                image.onload = () => {
                    imageContext.drawImage(image,
                        dx * (this.brickPanelWidth + this.brickCountTextSize),
                        dy * this.brickPanelHeight);
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

    private setupBrickObjects(): any {
        this.instructionBricks = [];

        for (const color of this.design.colors) {
            const brickTypeIds = Array.from(new Set(this.design.bricks
                .filter(b => b.colorId === color.id)
                .map(b => b.typeId)));

            if (brickTypeIds.length > 0) {
                const instructionBricks: InstructionBrick[] = [];

                for (const brickTypeId of brickTypeIds) {
                    const brickType = this.brickTypes.find(bt => bt.id === brickTypeId);

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
    }

    private createBrickObject(type: BrickType, color: BrickColor): PivotObject3D {
        const geometry = this.brickTypeService.getBrickTypeGeometry(type);

        const material = this.brickColorService.getBrickColorMaterial(color);

        const brickObject = new PivotObject3D();
        const mesh = new THREE.Mesh(geometry, material);

        const outlinesGeometry = new THREE.OutlinesGeometry(geometry, 45);

        const outlineMaterial = tinycolor(color.colorHex).getLuminance() > 0.1 ?
            INSTRUCTIONS_LIGHT_BRICK_OUTLINE_MATERIAL :
            INSTRUCTIONS_DARK_BRICK_OUTLINE_MATERIAL;

        const outline = new THREE.LineSegments(outlinesGeometry, outlineMaterial);
        mesh.add(outline);

        brickObject.add(mesh);

        return brickObject;
    }

    private setupBrickLevels() {
        this.brickLevels = [];

        const designHeight = Math.max(...this.design.bricks.map(b => b.y)) + 1;

        const builtBrickCells: Cell[] = [];

        const skippedBricks: Brick[] = [];

        let pushedBrickLevelCount = 0;

        for (let x = 0; x < designHeight + pushedBrickLevelCount; x++) {
            let buildableSkippedBricks = skippedBricks
                .filter(b => this.checkCellBuildable(b, builtBrickCells))
                .sort((a, b) => a.y - b.y);

            while (buildableSkippedBricks.length > 0) {
                // Group buildable skipped bricks by level
                const buildableSkippedBrickLevelMap = new Map<number, Brick[]>();

                buildableSkippedBricks.forEach(brick => {
                    const level = brick.y;
                    const skippedLevelBricks = buildableSkippedBrickLevelMap.get(level);

                    if (skippedLevelBricks) {
                        skippedLevelBricks.push(brick);
                    } else {
                        buildableSkippedBrickLevelMap.set(level, [brick]);
                    }
                });

                buildableSkippedBrickLevelMap.forEach((bricks, level) => {
                    const isTopView = level >= Math.max(...builtBrickCells.map(c => c.y));

                    const skippedBrickLevel = {
                        bricks: bricks,
                        isTopView: isTopView,
                        isFrontView: true,
                        isRightView: true
                    };

                    const skippedLevelCells: Cell[] = [];

                    for (let z = 0; z < bricks.length; z++) {
                        const skippedBrick = bricks[z];

                        skippedLevelCells.push(...this.getOccupiedCells(skippedBrick));

                        skippedBricks.splice(skippedBricks.indexOf(skippedBrick), 1);
                    }

                    builtBrickCells.push(...skippedLevelCells);

                    skippedBrickLevel.isFrontView = !(skippedLevelCells.some(c => c.z < this.design.size / 2)
                        && Math.max(...builtBrickCells.map(c => c.y)) > Math.max(...skippedLevelCells.map(c => c.y)));
                    skippedBrickLevel.isRightView = skippedLevelCells.filter(c => c.x >= this.design.size / 2).length
                        >= skippedLevelCells.filter(c => c.x < this.design.size / 2).length;

                    this.brickLevels.push(skippedBrickLevel);
                });

                buildableSkippedBricks = skippedBricks
                    .filter(b => this.checkCellBuildable(b, builtBrickCells))
                    .sort((a, b) => a.y - b.y);
            }

            const brickLevel = {
                bricks: [],
                isTopView: true,
                isFrontView: true,
                isRightView: true
            };

            const levelIndex = x < designHeight
                ? x
                : designHeight + pushedBrickLevelCount - x - 1;

            const levelBricks = this.design.bricks.filter(b => b.y === levelIndex);

            if (this.brickLevels.length < 1) {
                if (!this.isBrickLevelAdjacent(levelBricks)) {
                    pushedBrickLevelCount += 1;

                    continue;
                }
            }

            const levelCells: Cell[] = [];

            // Filter out non-buildable bricks
            for (let y = levelBricks.length - 1; y > -1; y--) {
                const brick = levelBricks[y];

                if ((this.brickLevels.length < 1 && pushedBrickLevelCount > 0)
                    || this.checkCellBuildable(brick, builtBrickCells)) {
                    levelCells.push(...this.getOccupiedCells(brick));
                } else {
                    levelBricks.splice(y, 1);

                    skippedBricks.push(brick);
                }
            }

            builtBrickCells.push(...levelCells);

            brickLevel.isTopView = levelIndex >= Math.max(...builtBrickCells.map(c => c.y));
            brickLevel.isFrontView = !(levelCells.some(c => c.z < this.design.size / 2)
                && Math.max(...builtBrickCells.map(c => c.y)) > Math.max(...levelCells.map(c => c.y)));
            brickLevel.isRightView = levelCells.filter(c => c.x >= this.design.size / 2).length
                >= levelCells.filter(c => c.x < this.design.size / 2).length;

            brickLevel.bricks = levelBricks;

            if (brickLevel.bricks.length > 0) {
                this.brickLevels.push(brickLevel);
            }
        }

        if (skippedBricks.length > 0) {
            console.error(`Unable to build instructions for ${skippedBricks.length} brick/s.`);
        }

        console.log(this.brickLevels);
    }

    isBrickLevelAdjacent(bricks: Brick[]): boolean {
        const brickCellsMap = new Map<Brick, Cell[]>();

        bricks.forEach(b => {
            brickCellsMap.set(b, this.getOccupiedCells(b));
        });

        const adjacentBricks: Brick[] = [];

        const firstBrick = bricks[0];

        this.getBrickAdjacents(firstBrick, brickCellsMap, adjacentBricks);

        const isLevelAdjacent = !bricks.some(b => adjacentBricks.indexOf(b) < 0);

        return isLevelAdjacent;
    }

    getBrickAdjacents(brick: Brick, brickCellsMap: Map<Brick, Cell[]>, adjacentBricks: Brick[]) {
        const brickCells = brickCellsMap.get(brick);

        brickCellsMap.forEach((cells, adjacentBrick) => {
            if (brick === adjacentBrick) {
                return;
            }

            for (const brickCell of brickCells) {
                const hasAdjacent = cells.some(c =>
                    (brickCell.x === c.x
                        && Math.abs(brickCell.z - c.z) === 1)
                    || (brickCell.z === c.z
                        && Math.abs(brickCell.x - c.x) === 1));

                if (hasAdjacent) {
                    if (adjacentBricks.indexOf(adjacentBrick) < 0) {
                        adjacentBricks.push(adjacentBrick);

                        this.getBrickAdjacents(adjacentBrick, brickCellsMap, adjacentBricks);
                    }
                }
            }
        });
    }

    getOccupiedCells(brick: Brick): Cell[] {
        const brickType = this.brickTypes.find(bt => bt.id === brick.typeId);

        const cells = [];

        for (let y = 0; y < brickType.height; y++) {
            for (let z = 0; z < brickType.depth; z++) {
                for (let x = 0; x < brickType.width; x++) {
                    if (!brickType.arrangement[(z * brickType.width) + x]) {
                        continue;
                    }

                    const position = new three.Vector3(x, y, z);
                    position.x -= brick.pivotX;
                    position.z -= brick.pivotZ;

                    const offset = this.getCellOffset(brick.rotationY, position);

                    const occupiedCell = new Cell(
                        brick.x + offset.x,
                        brick.y + offset.y,
                        brick.z + offset.z,
                        position
                    );

                    cells.push(occupiedCell);
                }
            }
        }

        return cells;
    }

    checkCellBuildable(brick: Brick, builtBrickCells: Cell[]): boolean {
        if (brick.y > 0) {
            const brickCells = this.getOccupiedCells(brick);

            const belowBrickObjectsCells = builtBrickCells.filter(c => c.y === brick.y - 1);

            let hasFooting = brickCells.some(x =>
                belowBrickObjectsCells.some(y => y.x === x.x && y.z === x.z));

            if (!hasFooting) {
                const aboveBrickObjectsCells = builtBrickCells.filter(c => c.y === brick.y + 1);

                hasFooting = brickCells.some(x =>
                    aboveBrickObjectsCells.some(y => y.x === x.x && y.z === x.z));

                if (!hasFooting) {
                    return false;
                }
            }
        }

        return true;
    }

    getCellOffset(yRotation: number, position: three.Vector3): three.Vector3 {
        const offset = new three.Vector3();

        switch (yRotation) {
            case -270:
                offset.x = position.z;
                offset.y = position.y;
                offset.z = -position.x;
                break;
            case -180:
                offset.x = -position.x;
                offset.y = position.y;
                offset.z = -position.z;
                break;
            case -90:
                offset.x = -position.z;
                offset.y = position.y;
                offset.z = position.x;
                break;
            case 0:
                offset.x = position.x;
                offset.y = position.y;
                offset.z = position.z;
                break;
            case 90:
                offset.x = position.z;
                offset.y = position.y;
                offset.z = -position.x;
                break;
            case 180:
                offset.x = -position.x;
                offset.y = position.y;
                offset.z = -position.z;
                break;
            case 270:
                offset.x = -position.z;
                offset.y = position.y;
                offset.z = position.x;
                break;
            default:
                break;
        }

        return offset;
    }
}

export class InstructionBrick {
    type: BrickType;
    color: BrickColor;
    builtColor: BrickColor;
    count: number;
    brickObject: PivotObject3D;
}

export class InstructionBrickLevel {
    bricks: Brick[];
    isTopView: boolean;
    isFrontView: boolean;
    isRightView: boolean;
}
