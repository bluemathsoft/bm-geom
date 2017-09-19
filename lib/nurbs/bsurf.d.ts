import { NDArray } from '@bluemath/common';
declare class BezierSurface {
    u_degree: number;
    v_degree: number;
    cpoints: NDArray;
    weights?: NDArray;
    constructor(u_degree: number, v_degree: number, cpoints: NDArray | number[][][], weights?: NDArray | number[][]);
    readonly dimension: number;
    isRational(): boolean;
    evaluate(u: number, v: number, tess: NDArray, uidx: number, vidx: number): void;
    tessellatePoints(resolution?: number): NDArray;
    tessellate(resolution?: number): {
        vertices: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
        faces: number[];
    };
}
declare class BSplineSurface {
    u_degree: number;
    v_degree: number;
    /**
     * cpoints is a two dimensional grid of coordinates.
     * The outermost index is along U, the next inner index is along V
     *
     *          V-->
     *      [
     *  U     [ [xa,ya,za], [xb,yb,zb], ...]
     *  |     [ [xl,yl,zl], [xm,ym,zm], ...]
     *  |     .
     *  v     .
     *      ]
     */
    cpoints: NDArray;
    u_knots: NDArray;
    v_knots: NDArray;
    weights?: NDArray;
    constructor(u_degree: number, v_degree: number, u_knots: NDArray | number[], v_knots: NDArray | number[], cpoints: NDArray | number[][][], weights?: NDArray | number[][]);
    readonly dimension: number;
    clone(): BSplineSurface;
    isRational(): boolean;
    isFlat(tolerance?: number): boolean;
    evaluate(u: number, v: number, tess: NDArray, uidx: number, vidx: number): void;
    tessellatePoints(resolution?: number): NDArray;
    tessellate(resolution?: number): {
        vertices: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
        faces: number[];
    };
    tessellatePointsAdaptive(tolerance?: number): NDArray[];
    split(uk: number, vk: number): never[];
    /**
     * Inserts knot un in the U knot vector r-times
     * Ref: Algorithm A5.3 "The NURBS book"
     * @param un Knot to be inserted
     * @param r Number of times to insert the knot
     */
    insertKnotU(un: number, r: number): void;
    /**
     * Inserts knot vn in the V knot vector r-times
     * Ref: Algorithm A5.3 "The NURBS book"
     * @param vn Knot to be inserted
     * @param r Number of times to insert the knot
     */
    insertKnotV(vn: number, r: number): void;
    /**
     * Insert knots in U and V knot vectors
     * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
     */
    insertKnotUV(un: number, vn: number, ur: number, vr: number): void;
    /**
     * Inserts multiple knots into the U knot vector at once
     * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
     */
    refineKnotsU(uklist: number[]): void;
    /**
     * Inserts multiple knots into the V knot vector at once
     * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
     */
    refineKnotsV(vklist: number[]): void;
    /**
     * Inserts multiple knots into the U and V knot vectors at once
     * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
     */
    refineKnotsUV(uklist: number[], vklist: number[]): void;
    decomposeU(): NDArray;
    decomposeV(): NDArray;
    /**
     * Creates grid of Bezier surfaces that represent this BSpline surface.
     * The routine first computes bezier strips along u (i.e. BSpline surfaces that
     * are Bezier in one direction and BSpline in other). Subsequently
     * decompose it called on each of these strips in the v direction
     * Algorithm A5.7 from "The NURBS Book"
     * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
     */
    decompose(): BezierSurface[];
    toString(): string;
}
export { BezierSurface, BSplineSurface };
