import { Directive, ContentChildren, QueryList, AfterViewInit, Input, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractCamera } from '../cameras/index';
import { GridHelperDirective } from '../objects/grid-helper.directive';
import { AbstractObject3D } from '../objects/index';

@Directive({
  selector: 'grid-highlighter',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => GridHighlighterDirective) }]
})
export class GridHighlighterDirective extends AbstractObject3D<THREE.Mesh> {
  @Input() camera: AbstractCamera<THREE.Camera>;
  @Input() gridHelper: GridHelperDirective;

  private _highlight: THREE.Mesh;

  constructor() {
    super();
  }

  protected newObject3DInstance(): THREE.Mesh {
    const highlightSize = this.gridHelper.divisionSize / 2;

    const geometry = new THREE.CylinderGeometry(highlightSize, 0, 5, 3);
    geometry.translate(highlightSize, 2.5, highlightSize);
    this._highlight = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());

    return this._highlight;
  }

  protected afterInit(): void {
  }
}
