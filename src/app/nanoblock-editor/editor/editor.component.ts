import { Component, OnInit, ViewChild } from '@angular/core';
import { SceneDirective } from '../../three-js/objects/index';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { GridSelectorDirective } from '../objects/grid-selector.directive';
import { Http } from '@angular/http';
import { BrickType } from './editor.models';

@Component({
  selector: 'ne-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, AfterViewInit {

  @ViewChild('scene')
  private _scene: SceneDirective;

  @ViewChild('gridSelector')
  private _gridSelector: GridSelectorDirective;

  private _brickTypes: BrickType[];

  constructor(private _http: Http) {

  }

  loadBrickTypes(): void {
    // this.http.get('.././brick-types.json')
    //   .map((res: any) => res.json())
    //   .catch((error: any) => console.log(error));
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
  }
}
