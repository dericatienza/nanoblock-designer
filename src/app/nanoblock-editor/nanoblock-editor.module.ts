import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridSelectorDirective } from './objects/grid-selector.directive';
import { ThreeJsModule } from '../three-js/three-js.module';
import { GridDirective } from './objects/grid.directive';
import { EditorComponent } from './editor/editor.component';
import { NanoblockEditorRoutingModule } from './nanoblock-editor-routing.module';
import { BrickTypeService } from './brick-type.service';
import { HttpClientModule } from '@angular/common/http';
import { BrickColorService } from './brick-color.service';
import { BrickTypesListComponent } from './brick-types-list/brick-types-list.component';
import { BrickTypeComponent } from './brick-type/brick-type.component';

@NgModule({
  imports: [
    CommonModule,
    ThreeJsModule,
    NanoblockEditorRoutingModule,
    HttpClientModule
  ],
  declarations: [
    GridSelectorDirective,
    GridDirective,
    EditorComponent,
    BrickTypesListComponent,
    BrickTypeComponent
  ],
  exports: [
    GridSelectorDirective,
    GridDirective
  ],
  providers: [BrickTypeService, HttpClientModule, BrickColorService]
})
export class NanoblockEditorModule { }
