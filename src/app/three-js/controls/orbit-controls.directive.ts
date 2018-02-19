import { Directive, Input, AfterViewInit, ContentChildren, QueryList, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractCamera } from '../cameras/index';
import { RendererComponent } from '../renderer/renderer.component';
import 'three/examples/js/controls/OrbitControls';

@Directive({
  selector: 'three-orbit-contols'
})
export class OrbitControlsDirective implements AfterViewInit {

  @ContentChildren(AbstractCamera, { descendants: true }) childCameras: QueryList<AbstractCamera<THREE.Camera>>;

  @Input() rotateSpeed = 1.0;
  @Input() zoomSpeed = 1.2;
  @Input() renderer: RendererComponent;

  private _controls: THREE.OrbitControls;

  get controls(): THREE.OrbitControls {
    return this._controls;
  }

  constructor(private _elemRef: ElementRef) {
    console.log('OrbitControlsDirective.constructor');
  }

  ngAfterViewInit(): void {
    console.log('OrbitControlsDirective.ngAfterViewInit');
    if (this.childCameras === undefined || this.childCameras.first === undefined) {
      throw new Error('Camera is not found');
    }

    this._controls = new THREE.OrbitControls(this.childCameras.first.camera, this.renderer.canvas);
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
