import { Directive, ContentChildren, QueryList, AfterViewInit, Input, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractCamera } from '../cameras/index';
import { GridHelperDirective } from '../objects/grid-helper.directive';
import { AbstractObject3D } from '../objects/index';
import { RendererComponent } from '../renderer/renderer.component';

@Directive({
  selector: 'grid-highlighter',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => GridHighlighterDirective) }]
})
export class GridHighlighterDirective extends AbstractObject3D<THREE.Mesh> {
  @Input() camera: AbstractCamera<THREE.Camera>;
  @Input() gridHelper: GridHelperDirective;
  @Input() renderer: RendererComponent;

  private _highlight: THREE.Mesh;
  private _raycaster = new THREE.Raycaster();
  private _mousePosition = new THREE.Vector2();

  constructor() {
    super();
  }

  protected newObject3DInstance(): THREE.Mesh {
    const highlightSize = this.gridHelper.divisionSize / 2;

    const geometry = new THREE.CylinderGeometry(highlightSize, 0, 5, 3);
    geometry.translate(0, 2.5, 0);
    this._highlight = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());

    return this._highlight;
  }

  protected afterInit(): void {
    this.renderer.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(event: MouseEvent): any {
    this._mousePosition.x = (event.clientX / this.renderer.canvas.clientWidth) * 2 - 1;
    this._mousePosition.y = - (event.clientY / this.renderer.canvas.clientHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mousePosition, this.camera.camera);

    const intersects = this._raycaster.intersectObject(this.gridHelper.getObject());

    if (intersects.length > 0) {
      this._highlight.position.copy(intersects[0].point);
      // this._highlight.translateX(-2);
      // this._highlight.translateZ(-2);

      // this.renderer.render();
    }
  }
}
