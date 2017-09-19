import * as nurbs from './nurbs';
import { NDArray } from '@bluemath/common';
declare class Axis {
    origin: NDArray;
    z: NDArray;
}
declare class CoordSystem {
    origin: NDArray;
    z: NDArray;
    x: NDArray;
    y: NDArray;
    constructor(origin: NDArray | number[], x: NDArray | number[], z: NDArray | number[]);
}
export { nurbs, Axis, CoordSystem };
