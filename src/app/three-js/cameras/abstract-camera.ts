import { AfterViewInit, Input, QueryList, ContentChildren } from '@angular/core';
import * as THREE from 'three';

export abstract class AbstractCamera<T extends THREE.Camera> implements AfterViewInit {

  camera: T;

  constructor() {
  }

  public ngAfterViewInit(): void {
    this.afterInit();
  }

  protected abstract afterInit(): void;

  public abstract updateAspectRatio(aspect: number);

}
