import { Component, OnInit, Input, AfterViewInit, ViewChild } from '@angular/core';
import { BrickType, BrickColor } from '../editor/editor.models';
import { SceneDirective } from '../../three-js/objects';
import { Mesh, MeshNormalMaterial } from 'three';
import { BrickTypeService } from '../brick-type.service';
import { BrickColorService } from '../brick-color.service';
import THREE = require('three');

@Component({
  selector: 'ne-brick-type',
  templateUrl: './brick-type.component.html',
  styleUrls: ['./brick-type.component.scss']
})
export class BrickTypeComponent implements OnInit, AfterViewInit {
  @ViewChild('scene')
  private _scene: SceneDirective;

  @Input() brickType: BrickType;

  private _brickColor: BrickColor;
  get brickColor(): BrickColor {
    return this._brickColor;
  }

  @Input()
  set brickColor(v: BrickColor) {
    this._brickColor = v;

    if (this.mesh) {
      this.mesh.material = this._brickColorService.getBrickColorMaterial(this.brickColor);
    }
  }

  mesh: Mesh;

  constructor(private _brickTypeService: BrickTypeService, private _brickColorService: BrickColorService) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    const geometry = this._brickTypeService.getBrickTypeGeometry(this.brickType);

    const material = this._brickColorService.getBrickColorMaterial(this.brickColor);

    this.mesh = new THREE.Mesh(geometry, material);

    const studSize = this._brickTypeService.studSize;

    this.mesh.position.set(
      (this.brickType.width - 1) * -studSize.x / 2,
      (this.brickType.height - 1) * -studSize.y / 2,
      (this.brickType.depth - 1) * -studSize.z / 2
    );

    this._scene.object.add(this.mesh);
  }

}
