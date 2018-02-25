import { Component, OnInit, Input } from '@angular/core';
import { BrickType } from '../editor/editor.models';

@Component({
  selector: 'ne-brick-type',
  templateUrl: './brick-type.component.html',
  styleUrls: ['./brick-type.component.scss']
})
export class BrickTypeComponent implements OnInit {

  @Input() brickType: BrickType;

  constructor() { }

  ngOnInit() {
  }

}
