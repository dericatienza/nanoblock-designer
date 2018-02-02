export class MathHelper {
    static snap(value: number, multiple: number): number {
        return multiple * Math.round(value / multiple);
    }
}
