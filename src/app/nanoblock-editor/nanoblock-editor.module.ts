import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridSelectorDirective } from './objects/grid-selector.directive';
import { ThreeJsModule } from '../three-js/three-js.module';
import { GridDirective } from './objects/grid.directive';
import { EditorComponent } from './editor/editor.component';
import { NanoblockEditorRoutingModule } from './nanoblock-editor-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ThreeJsModule,
    NanoblockEditorRoutingModule
  ],
  declarations: [
    GridSelectorDirective,
    GridDirective,
    EditorComponent
  ],
  exports: [
    GridSelectorDirective,
    GridDirective
  ]
})
export class NanoblockEditorModule { }
