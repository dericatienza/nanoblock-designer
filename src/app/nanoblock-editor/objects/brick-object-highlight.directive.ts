import { Directive, forwardRef } from '@angular/core';
import { AbstractObject3D } from '../../three-js/objects';
import { PivotObject3D } from '../editor/pivot-object';
import { BrickTypeService } from '../brick-type.service';
import { Mesh, LineBasicMaterial } from 'three';
import { BrickObject } from '../editor/brick-object';
import * as three from 'three';
import { CELL_SIZE } from './grid.directive';

// import '../../../assets/js/OutlinesGeometry';

declare var THREE: any;

@Directive({
  selector: 'ne-brick-object-highlight',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => BrickObjectHighlightDirective) }],
  exportAs: 'ne-brick-object-highlight'
})
export class BrickObjectHighlightDirective extends AbstractObject3D<PivotObject3D> {
  highlight: three.Mesh;

  private _highlightMaterial = new LineBasicMaterial(
    {
      color: 'violet',
      side: three.BackSide
    }
  );

  constructor(private _brickTypeService: BrickTypeService) {
    super();
  }

  protected newObject3DInstance(): PivotObject3D {
    const pivotObject = new PivotObject3D();

    return pivotObject;
  }

  protected afterInit(): void {
  }

  setHighlight(brickObject: BrickObject) {
    this.removeHighlight();

    this.highlight = this._brickTypeService.getBrickTypeHighlightMesh(brickObject.brickType);

    this.highlight.material = this._highlightMaterial;

    this.highlight.position.setZ(-CELL_SIZE.z * brickObject.brickPivotZ);
    this.highlight.position.setX(-CELL_SIZE.x * brickObject.brickPivotX);

    this.object.position.set(brickObject.position.x, brickObject.position.y, brickObject.position.z);

    this.object.add(this.highlight);

    const radians = three.Math.degToRad(brickObject.rotationY);

    this.object.pivot.setRotationFromAxisAngle(new three.Vector3(0, 1, 0), radians);
  }

  removeHighlight() {
    if (this.highlight) {
      this.object.remove(this.highlight);
    }
  }
}
