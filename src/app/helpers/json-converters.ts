import { JsonConverter, JsonCustomConvert } from 'json2typescript';

@JsonConverter
export class IntToBooleanJsonConverter implements JsonCustomConvert<Boolean> {
    serialize(boolean: Boolean): any {
        return boolean ? '1' : '0';
    }
    deserialize(int: any): Boolean {
        return int > 0 ? true : false;
    }
}

@JsonConverter
export class IntArrayToBooleanArrayJsonConverter implements JsonCustomConvert<Boolean[]> {
    serialize(booleans: Boolean[]): any {
        return booleans.map(boolean => boolean ? '1' : '0').join();
    }
    deserialize(data: any): Boolean[] {
        return data.map(int => int > 0 ? true : false);
    }
}
