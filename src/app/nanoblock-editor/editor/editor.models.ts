import { JsonObject, JsonProperty } from 'json2typescript';
import { IntArrayToBooleanArrayJsonConverter } from '../../helpers/json-converters';

@JsonObject
export class BrickType {
    id: number = undefined;
    name: string = undefined;
    // tslint:disable-next-line:no-inferrable-types
    width: number = 1;
    // tslint:disable-next-line:no-inferrable-types
    depth: number = 1;
    // tslint:disable-next-line:no-inferrable-types
    height: number = 1;

    @JsonProperty('arrangement', IntArrayToBooleanArrayJsonConverter)
    arrangement: boolean[] = [];
}

@JsonObject
export class BrickColor {
    @JsonProperty('id', Number)
    id: number = undefined;
    @JsonProperty('name', String)
    name: string = undefined;
    @JsonProperty('isClear', Boolean)
    // tslint:disable-next-line:no-inferrable-types
    isClear: boolean = false;
    @JsonProperty('colorHex', String)
    // tslint:disable-next-line:no-inferrable-types
    colorHex: string = '0xFFFFFF';

    static clone(brickColor: BrickColor): BrickColor {
        const cloneBrickColor = new BrickColor();

        cloneBrickColor.id = brickColor.id;
        cloneBrickColor.name = brickColor.name;
        cloneBrickColor.isClear = brickColor.isClear;
        cloneBrickColor.colorHex = brickColor.colorHex;

        return cloneBrickColor;
    }
}

@JsonObject
export class Brick {
    @JsonProperty('id', Number)
    id: number = undefined;
    @JsonProperty('x', Number)
    x: number = undefined;
    @JsonProperty('y', Number)
    y: number = undefined;
    @JsonProperty('z', Number)
    z: number = undefined;
    @JsonProperty('rotationX', Number)
    rotationX: number = undefined;
    @JsonProperty('rotationY', Number)
    rotationY: number = undefined;
    @JsonProperty('rotationZ', Number)
    rotationZ: number = undefined;
    @JsonProperty('pivotX', Number)
    pivotX: number = undefined;
    @JsonProperty('pivotY', Number)
    pivotY: number = undefined;
    @JsonProperty('pivotZ', Number)
    pivotZ: number = undefined;
    @JsonProperty('typeId', Number)
    typeId: number = undefined;
    @JsonProperty('colorId', Number)
    colorId: number = undefined;
}

@JsonObject
export class Design {
    @JsonProperty('size', Number, true)
    size: number = undefined;
    @JsonProperty('bricks', [Brick])
    bricks: Brick[] = undefined;
    @JsonProperty('colors', [BrickColor])
    colors: BrickColor[] = undefined;
}
