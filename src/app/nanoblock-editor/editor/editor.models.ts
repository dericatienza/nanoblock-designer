import { JsonObject, JsonProperty } from 'json2typescript';
import { IntArrayToBooleanArrayJsonConverter } from '../../helpers/json-converters';

@JsonObject
export class BrickType {
    id: number = undefined;
    name: string = undefined;
    width = 1;
    depth = 1;
    height = 1;
    isActive = true;

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
    isClear = false;
    @JsonProperty('colorHex', String)
    colorHex = '0xFFFFFF';

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
