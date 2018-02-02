import { Directive, ContentChildren, QueryList, AfterViewInit, Input, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from '../../three-js/objects/index';
import { GridHelperDirective } from '../../three-js/objects/grid-helper.directive';
import { RendererComponent } from '../../three-js/renderer/renderer.component';
import { AbstractCamera } from '../../three-js/cameras/index';
import { Vector3 } from 'three';
import { MathHelper } from '../../helpers/math-helper';

@Directive({
  selector: 'ne-grid-highlighter',
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
    this.initHighlight();

    return this._highlight;
  }

  initHighlight(): void {
    const highlightSize = this.gridHelper.divisionSize / 2;

    const geometry = new THREE.CylinderGeometry(highlightSize, 0, 5, 3);
    geometry.translate(highlightSize, 2.5, highlightSize);
    this._highlight = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
  }

  protected afterInit(): void {
    this.renderer.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(event: MouseEvent): any {
    this._mousePosition.x = (event.clientX / this.renderer.canvas.clientWidth) * 2 - 1;
    this._mousePosition.y = - (event.clientY / this.renderer.canvas.clientHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mousePosition, this.camera.camera);

    const intersects = this._raycaster.intersectObject(this.gridHelper.object);

    if (intersects.length > 0) {
      const intersectPoint = intersects[0].point;

      const position = new Vector3(
        MathHelper.snap(intersectPoint.x, this.gridHelper.divisionSize),
        intersectPoint.y,
        MathHelper.snap(intersectPoint.z, this.gridHelper.divisionSize)
      );

      this._highlight.position.copy(position);
    }
  }
}
