import {
    Component, OnInit, ViewChild, ElementRef, ContentChildren, HostListener, QueryList,
    EventEmitter, Output, AfterViewInit, Input
} from '@angular/core';
import * as THREE from 'three';
import 'stats.js';
import * as RendererStats from '@xailabs/three-renderer-stats';
import { AbstractCamera } from '../cameras';
import { SceneDirective } from '../objects/scene.directive';

@Component({
    selector: 'three-renderer',
    templateUrl: './renderer.component.html',
    styleUrls: ['./renderer.component.scss']
})
export class RendererComponent implements AfterViewInit, OnInit {

    private renderer: THREE.WebGLRenderer;

    @Input() clearColor: THREE.Color = new THREE.Color('#d3d3d3');
    @Input() clearColorAlpha = 1;
    @Input() displayStats = false;

    @ViewChild('canvas')
    private canvasRef: ElementRef; // NOTE: say bye-bye to server-side rendering ;)

    private _stats: Stats;
    private _rendererStats: RendererStats;

    @ContentChildren(SceneDirective, { descendants: true }) sceneComponents: QueryList<SceneDirective>; // TODO: Multiple scenes
    @ContentChildren(AbstractCamera, { descendants: true })
    cameraComponents: QueryList<AbstractCamera<THREE.Camera>>; // TODO: Multiple cameras

    ngOnInit(): void {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
    }

    constructor() {
        this.render = this.render.bind(this);
    }

    ngAfterViewInit() {
        if (this.displayStats) {
            this._stats = new Stats();

            this._rendererStats = new RendererStats();
            this._rendererStats.domElement.style.position = 'absolute';
            this._rendererStats.domElement.style.left = '0px';
            this._rendererStats.domElement.style.top = '48px';

            this.canvas.parentElement.appendChild(this._stats.dom);
            this.canvas.parentElement.appendChild(this._rendererStats.domElement);
        }

        this.startRendering();
    }

    get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    private startRendering() {
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(this.clearColor, this.clearColorAlpha);
        this.renderer.autoClear = true;

        this.updateChildCamerasAspectRatio();

        this.render();
    }

    public render() {
        const sceneComponent = this.sceneComponents.first;
        const cameraComponent = this.cameraComponents.first;

        if (this.displayStats) {
            this._stats.begin();
        }

        this.renderer.render(sceneComponent.object, cameraComponent.camera);

        if (this.displayStats) {
            this._stats.end();

            this._rendererStats.update(this.renderer);
        }
        requestAnimationFrame(this.render);
    }

    private calculateAspectRatio(): number {
        const height = this.canvas.clientHeight;
        if (height === 0) {
            return 0;
        }
        return this.canvas.clientWidth / this.canvas.clientHeight;
    }

    @HostListener('window:resize', ['$event'])
    public onResize(event: Event) {
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';


        this.updateChildCamerasAspectRatio();

        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.render();
    }

    public updateChildCamerasAspectRatio() {
        const aspect = this.calculateAspectRatio();
        this.cameraComponents.forEach(camera => camera.updateAspectRatio(aspect));
    }

    /*
    @HostListener('document:keypress', ['$event'])
    public onKeyPress(event: KeyboardEvent) {

    }
  */

}
