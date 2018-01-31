import { Directive, AfterViewInit, ContentChildren, ContentChild, QueryList } from '@angular/core';
import * as THREE from 'three';
import { AbstractCamera } from '../cameras/index';
import { RendererComponent } from '../renderer/renderer.component';
import { OrbitControlsDirective } from './orbit-controls.directive';
import '../js/EnableThreeExamples';
import 'three/examples/js/controls/DragControls';
import { ObjectLoaderDirective } from '../objects/object-loader.directive';

@Directive({
  selector: 'three-drag-controls'
})
export class DragControlsDirective implements AfterViewInit {

  @ContentChildren(AbstractCamera, { descendants: true }) childCameras: QueryList<AbstractCamera<THREE.Camera>>;
  @ContentChildren(RendererComponent, { descendants: true }) childRenderers: QueryList<RendererComponent>;
  @ContentChildren(OrbitControlsDirective, { descendants: true }) childControls: QueryList<OrbitControlsDirective>;
  @ContentChildren(ObjectLoaderDirective, { descendants: true }) childObjects: QueryList<ObjectLoaderDirective>;

  constructor() {
    console.log('DragControlsDirective.constructor');
  }

  private controls: THREE.DragControls;

  ngAfterViewInit(): void {
    console.log('DragControlsDirective.ngAfterViewInit');
    if (this.childCameras === undefined || this.childCameras.first === undefined) {
      throw new Error('Camera is not found');
    }
    if (this.childRenderers === undefined || this.childRenderers.first === undefined) {
      throw new Error('Renderer is not found');
    }

    console.log(`Draggable objects: ${this.childObjects} Count: ${this.childObjects.length}`);
    const objects = this.childObjects.map(ao => ao.getObject());

    this.controls = new THREE.DragControls(objects, this.childCameras.first.camera, this.childRenderers.first.canvas);
    this.controls.addEventListener('dragstart', () => this.childControls.first.controls.enabled = false);
    this.controls.addEventListener('drag', this.childRenderers.first.render);
    this.controls.addEventListener('dragend', () => this.childControls.first.controls.enabled = true);
  }
}
