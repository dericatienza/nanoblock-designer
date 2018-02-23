import { JsonObject, JsonProperty } from 'json2typescript';
import { IntArrayToBooleanArrayJsonConverter } from '../../helpers/json-converters';

@JsonObject
export class BrickType {
    id: number = undefined;
    name: string = undefined;
    // tslint:disable-next-line:no-inferrable-types
    width: number = 1;
    // tslint:disable-next-line:no-inferrable-types
    height: number = 1;

    @JsonProperty('arrangement', IntArrayToBooleanArrayJsonConverter)
    arrangement: boolean[] = [];
}

@JsonObject
export class BrickColor {
    id: number = undefined;
    name: string = undefined;
    // tslint:disable-next-line:no-inferrable-types
    isClear: boolean = false;
    // tslint:disable-next-line:no-inferrable-types
    colorHex: string = '0xFFFFFF';
}

@JsonObject
export class Brick {
    id: number = undefined;
    x: number = undefined;
    y: number = undefined;
    z: number = undefined;
    typeId: number = undefined;
    colorId: number = undefined;
}
