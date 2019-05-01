import { Directive, Input, AfterViewInit, ContentChildren, QueryList, ViewChild, ElementRef } from '@angular/core';
import { AbstractCamera } from '../cameras/index';
import { RendererComponent } from '../renderer/renderer.component';
import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

declare var THREE: any;

@Directive({
    selector: 'three-orbit-controls',
    exportAs: 'three-orbit-controls'
})
export class OrbitControlsDirective implements AfterViewInit {

    @ContentChildren(AbstractCamera, { descendants: true }) childCameras: QueryList<AbstractCamera<three.Camera>>;

    @Input() rotateSpeed = 1.0;
    @Input() zoomSpeed = 1.2;
    @Input() renderer: RendererComponent;

    private _controls: OrbitControls;

    get controls(): OrbitControls {
        return this._controls;
    }

    constructor(private _elemRef: ElementRef) {
    }

    ngAfterViewInit(): void {
        if (this.childCameras === undefined || this.childCameras.first === undefined) {
            throw new Error('Camera is not found');
        }

        this._controls = new OrbitControls(this.childCameras.first.camera, this.renderer.canvas);
        this._controls.screenSpacePanning = true;
        this._controls.rotateSpeed = this.rotateSpeed;
        this._controls.zoomSpeed = this.zoomSpeed;
        // this._controls.addEventListener('change', this.childRenderers.first.render);
        // this.childRenderers.first.render();
    }

    // enable() {
    //   this._controls.enabled = true;
    // }

    // disable() {
    //   this._controls.enabled = false;
    // }
}
