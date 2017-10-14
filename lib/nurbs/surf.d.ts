import { BSplineSurface } from './bsurf';
import { BSplineCurve } from './bcurve';
import { NDArray } from '@bluemath/common';
import { CoordSystem } from '..';
export declare class BilinearSurface extends BSplineSurface {
    constructor(p00: number[], p01: number[], p10: number[], p11: number[]);
}
export declare class GeneralCylinder extends BSplineSurface {
    constructor(curve: BSplineCurve, direction: NDArray | number[], height: number);
}
export declare class Cylinder extends GeneralCylinder {
    constructor(coordsys: CoordSystem, radius: number, height: number);
}
export declare class RuledSurface extends BSplineSurface {
}
export declare class RevolutionSurface extends BSplineSurface {
}
export declare class Cone extends RevolutionSurface {
}
export declare class Sphere extends RevolutionSurface {
}
export declare class Torus extends RevolutionSurface {
}
