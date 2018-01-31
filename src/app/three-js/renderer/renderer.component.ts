import { Component, OnInit, ViewChild, ElementRef, ContentChildren, HostListener, QueryList, EventEmitter, Output, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { AbstractCamera } from '../cameras';
import { SceneDirective } from '../objects/scene.directive';


@Component({
  selector: 'three-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.scss']
})
export class RendererComponent implements AfterViewInit {

  private renderer: THREE.WebGLRenderer;

  @ViewChild('canvas')
  private canvasRef: ElementRef; // NOTE: say bye-bye to server-side rendering ;)

  @ContentChildren(SceneDirective) sceneComponents: QueryList<SceneDirective>; // TODO: Multiple scenes
  @ContentChildren(AbstractCamera) cameraComponents: QueryList<AbstractCamera<THREE.Camera>>; // TODO: Multiple cameras

  constructor() {
    console.log("RendererComponent.constructor");
    this.render = this.render.bind(this);
  }

  ngAfterViewInit() {
    console.log("RendererComponent.ngAfterViewInit");
    this.startRendering();
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private startRendering() {
    console.log("RendererComponent.startRendering");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.autoClear = true;

    this.updateChildCamerasAspectRatio();
    this.render();
  }

  public render() {
    //if (this.sceneComponents != undefined && this.sceneComponents.length == 1 && this.cameraComponents != undefined && this.cameraComponents.length == 1) {
      let sceneComponent = this.sceneComponents.first;
      let cameraComponent = this.cameraComponents.first;
      //console.log("render");
      //console.log(scene.getObject());
      //console.log(camera.camera);
      this.renderer.render(sceneComponent.getObject(), cameraComponent.camera);
    //}
  }

  private calculateAspectRatio(): number {
    let height = this.canvas.clientHeight;
    if (height === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: Event) {
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    console.log("RendererComponent.onResize: " + this.canvas.clientWidth + ", " + this.canvas.clientHeight);

    this.updateChildCamerasAspectRatio();

    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.render();
  }

  public updateChildCamerasAspectRatio() {
    let aspect = this.calculateAspectRatio();
    this.cameraComponents.forEach(camera => camera.updateAspectRatio(aspect));
  }

  /*
  @HostListener('document:keypress', ['$event'])
  public onKeyPress(event: KeyboardEvent) {
    console.log("onKeyPress: " + event.key);
  }
*/

}
