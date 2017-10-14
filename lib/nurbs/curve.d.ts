import { BSplineCurve } from './bcurve';
import { CoordSystem } from '..';
export declare class LineSegment extends BSplineCurve {
    constructor(from: number[], to: number[]);
}
export declare class CircleArc extends BSplineCurve {
    constructor(coordsys: CoordSystem, radius: number, start: number, end: number);
}
export declare class Circle extends CircleArc {
    constructor(coord: CoordSystem, radius: number);
}
