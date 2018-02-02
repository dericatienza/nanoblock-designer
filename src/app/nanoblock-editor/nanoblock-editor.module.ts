import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridHighlighterDirective } from './objects/grid-highlighter.directive';
import { ThreeJsModule } from '../three-js/three-js.module';
import { GridDirective } from './objects/grid.directive';

@NgModule({
  imports: [
    CommonModule,
    ThreeJsModule
  ],
  declarations: [
    GridHighlighterDirective,
    GridDirective
  ],
  exports: [
    GridHighlighterDirective,
    GridDirective
  ]
})
export class NanoblockEditorModule { }
