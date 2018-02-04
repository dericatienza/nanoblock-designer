import { EditorComponent } from './editor/editor.component';
import { Routes, RouterModule, RouteReuseStrategy } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
    {
        path: 'editor',
        component: EditorComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NanoblockEditorRoutingModule { }
