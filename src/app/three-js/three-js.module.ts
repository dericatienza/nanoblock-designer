import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxesHelperDirective, SceneDirective } from './objects';
import { DegreePipe } from './pipes/degree.pipe';
import { RendererComponent } from './renderer/renderer.component';
import { PerspectiveCameraDirective } from './cameras';
import { OrbitControlsDirective } from './controls/orbit-controls.directive';
import { ObjectLoaderDirective } from './objects/object-loader.directive';
import { GridHelperDirective } from './objects/grid-helper.directive';
import { PointLightDirective } from './objects/point-light.directive';
import { JsonLoaderDirective } from './objects/json-loader.directive';
import { OrthographicCameraDirective } from './cameras/orthographic-camera.directive';
import { AmbientLightDirective } from './objects/ambient-light.directive';
import { DirectionalLightDirective } from './objects/directional-light.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    RendererComponent,
    SceneDirective,
    AxesHelperDirective,
    GridHelperDirective,
    DegreePipe,
    PerspectiveCameraDirective,
    OrthographicCameraDirective,
    OrbitControlsDirective,
    ObjectLoaderDirective,
    PointLightDirective,
    JsonLoaderDirective,
    AmbientLightDirective,
    DirectionalLightDirective
  ],
  exports: [
    RendererComponent,
    SceneDirective,
    AxesHelperDirective,
    GridHelperDirective,
    DegreePipe,
    PerspectiveCameraDirective,
    OrthographicCameraDirective,
    OrbitControlsDirective,
    ObjectLoaderDirective,
    PointLightDirective,
    JsonLoaderDirective,
    AmbientLightDirective,
    DirectionalLightDirective
  ]
})
export class ThreeJsModule { }
