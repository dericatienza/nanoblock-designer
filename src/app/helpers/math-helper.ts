export class MathHelper {
    static snap(value: number, multiple: number): number {
        return Math.floor((value / multiple) * multiple);
    }
}
