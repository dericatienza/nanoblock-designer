import { Component, OnInit, Input } from '@angular/core';
import { BrickColor } from '../editor/editor.models';

@Component({
  selector: 'ne-brick-color',
  templateUrl: './brick-color.component.html',
  styleUrls: ['./brick-color.component.scss']
})
export class BrickColorComponent implements OnInit {

  @Input() brickColor: BrickColor;

  constructor() { }

  ngOnInit() {
  }
}
