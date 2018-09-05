import { Design, Brick, BrickType, BrickColor } from './editor.models';
import { BrickTypeService } from '../brick-type.service';
import { BrickColorService } from '../brick-color.service';
import { BrickObject } from './brick-object';
import * as three from 'three';
import { PivotObject3D } from './pivot-object';
import { CELL_SIZE } from '../objects/grid.directive';
import { Scene, Renderer, Camera } from 'three';
import * as mergeImg from 'merge-img';
import Jimp = require('jimp');

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

    padding = 15;

    constructor(public design: Design,
        public brickTypeService: BrickTypeService,
        public brickColorService: BrickColorService) {
    }

    generate() {
        this.brickTypeService.getBrickTypes()
            .subscribe((brickTypes: BrickType[]) => {
                this.setupBrickObjects(brickTypes);
                this.setupBrickLevels();

                this.internalGenerate();

                this.onGenerated('');
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
        renderer.setClearColor('#d3d3d3', 0);

        const canvas = renderer.domElement;
        canvas.style.display = 'none';

        document.body.appendChild(renderer.domElement);

        // Bricks panel generation
        const maxBrickTypeSize = Math.max(...this.instructionBricks
            .map(ib => ib.type)
            .map(bt => Math.max(bt.width, bt.height, bt.depth)));

        const maxBrickTypeUnitSize = maxBrickTypeSize * CELL_SIZE.x;

        const brickPanelBrickSize = 55;

        renderer.setSize(brickPanelBrickSize, brickPanelBrickSize);

        const bricksScene = new three.Scene();

        const light = new three.AmbientLight('white');

        bricksScene.add(light);

        console.log(maxBrickTypeSize);

        const cameraSize = 12;

        const camera = new three.OrthographicCamera(
            -cameraSize,
            cameraSize,
            cameraSize,
            -cameraSize,
            1,
            1000);

        camera.position.set(maxBrickTypeUnitSize, maxBrickTypeUnitSize, maxBrickTypeUnitSize);

        camera.lookAt(0, 0, 0);

        const brickImagesDataUrls: string[] = [];

        let brickObjectClone: PivotObject3D = null;

        const imageWindow = window.open('', '');
        imageWindow.document.title = 'Bricks';

        const studSize = this.brickTypeService.studSize;

        for (const instructionBrick of this.instructionBricks) {
            if (brickObjectClone) {
                bricksScene.remove(brickObjectClone);
            }

            brickObjectClone = instructionBrick.brickObject.clone();

            const boundingBoxSize = new three.Box3().setFromObject(brickObjectClone).getSize();

            brickObjectClone.position.set(
                (instructionBrick.type.width - 1) * -studSize.x / 2,
                (instructionBrick.type.height - 1) * -studSize.y / 2,
                (instructionBrick.type.depth - 1) * -studSize.z / 2
            );

            bricksScene.add(brickObjectClone);

            brickImagesDataUrls.push(this.snapScene(renderer, bricksScene, camera));
        }

        const mergeObjects = [];

        const imageCanvas = document.createElement('canvas');

        document.body.appendChild(imageCanvas);

        imageCanvas.width = (brickImagesDataUrls.length / this.brickPanelRows + 1) * brickPanelBrickSize;
        imageCanvas.height = (this.brickPanelRows + 1) * brickPanelBrickSize;
        imageCanvas.style.display = 'none';

        const imageContext = imageCanvas.getContext('2d');

        for (let x = 0; x < brickImagesDataUrls.length / this.brickPanelRows; x++) {
            for (let y = 0; y < this.brickPanelRows && x + y < brickImagesDataUrls.length; y++) {
                const image = new Image();
                image.src = brickImagesDataUrls[x + y];

                const dx = x;
                const dy = y;

                image.onload = () => {
                    imageContext.drawImage(image,
                        dx * brickPanelBrickSize,
                        dy * brickPanelBrickSize);
                };
            }
        }

        setTimeout(() => {
            const instructionsImage = new Image();
            instructionsImage.src = imageCanvas.toDataURL();

            imageWindow.document.body.appendChild(instructionsImage);
        }, 0);
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

                    instructionBricks.push({
                        type: brickType,
                        color: color,
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
        const mesh = new three.Mesh(geometry, material);

        const outlinesGeometry = new THREE.OutlinesGeometry(geometry, 45);
        const outline = new three.LineSegments(outlinesGeometry, INSTRUCTIONS_BRICK_OUTLINE_MATERIAL);
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
    count: number;
    brickObject: PivotObject3D;
}
