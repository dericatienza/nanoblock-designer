import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ThreeJsModule } from './three-js/three-js.module';
import { NanoblockEditorModule } from './nanoblock-editor/nanoblock-editor.module';
import { AppRoutingModule } from './app-routing.module';

import { DeviceDetectorModule } from 'ngx-device-detector';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        ThreeJsModule,
        NanoblockEditorModule,
        AppRoutingModule,
        DeviceDetectorModule.forRoot()
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
