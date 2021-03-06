import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { BrickColorsListComponent } from './brick-colors-list/brick-colors-list.component';
import { BrickColorComponent } from './brick-color/brick-color.component';
import { ColorPickerModule } from 'ngx-color-picker';

import { FileHelpersModule } from 'ngx-file-helpers';
import { BrowserModule } from '@angular/platform-browser';
import { BrickObjectHighlightDirective } from './objects/brick-object-highlight.directive';
import { EditorControlsComponent } from './editor-controls/editor-controls.component';
import { EditorModeComponent } from './editor-mode/editor-mode.component';

@NgModule({
  imports: [
    CommonModule,
    ThreeJsModule,
    NanoblockEditorRoutingModule,
    HttpClientModule,
    ColorPickerModule,
    FileHelpersModule,
    BrowserModule,
    FormsModule
  ],
  declarations: [
    GridSelectorDirective,
    GridDirective,
    EditorComponent,
    BrickTypesListComponent,
    BrickTypeComponent,
    BrickColorsListComponent,
    BrickColorComponent,
    BrickObjectHighlightDirective,
    EditorControlsComponent,
    EditorModeComponent
  ],
  exports: [
    GridSelectorDirective,
    GridDirective
  ],
  providers: [BrickTypeService, HttpClientModule, BrickColorService]
})
export class NanoblockEditorModule { }
