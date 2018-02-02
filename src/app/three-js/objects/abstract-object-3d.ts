import { AfterViewInit, Input, QueryList, ContentChildren } from '@angular/core';
import * as THREE from 'three';

export abstract class AbstractObject3D<T extends THREE.Object3D> implements AfterViewInit {

  @ContentChildren(AbstractObject3D, { descendants: false }) childNodes: QueryList<AbstractObject3D<THREE.Object3D>>;

  @Input() rotateX: number;
  @Input() rotateY: number;
  @Input() rotateZ: number;

  @Input() translateX: number;
  @Input() translateY: number;
  @Input() translateZ: number;

  private _object: T;

  public ngAfterViewInit(): void {
    console.log('AbstractObject3D.ngAfterViewInit');
    this._object = this.newObject3DInstance();

    this.applyTranslation();
    this.applyRotation();

    if (this.childNodes !== undefined && this.childNodes.length > 1) {
      this.childNodes.filter(i => i !== this && i.object !== undefined).forEach(i => {
        // console.log("Add child for " + this.constructor.name);
        // console.log(i);
        this.addChild(i.object);
      });
    } else {
      // console.log("No child Object3D for: " + this.constructor.name);
    }

    this.afterInit();
  }

  private applyRotation(): void {
    if (this.rotateX !== undefined) { this._object.rotateX(this.rotateX); }
    if (this.rotateY !== undefined) { this._object.rotateY(this.rotateY); }
    if (this.rotateZ !== undefined) { this._object.rotateZ(this.rotateZ); }
  }

  private applyTranslation(): void {
    if (this.translateX !== undefined) { this._object.translateX(this.translateX); }
    if (this.translateY !== undefined) { this._object.translateY(this.translateY); }
    if (this.translateZ !== undefined) { this._object.translateZ(this.translateZ); }
  }

  protected addChild(object: THREE.Object3D): void {
    this._object.add(object);
  }

  public get object(): T {
    return this._object;
  }

  protected abstract newObject3DInstance(): T;

  protected abstract afterInit(): void;

}
