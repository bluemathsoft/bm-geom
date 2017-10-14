import { NDArray, AABB, TypedArray } from '@bluemath/common';
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
        vertices: TypedArray;
        faces: number[];
    };
    aabb(): AABB;
    clone(): BezierSurface;
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
    aabb(): AABB;
    isRational(): boolean;
    isFlat(tolerance?: number): boolean;
    setUKnots(u_knots: NDArray): void;
    setVKnots(v_knots: NDArray): void;
    evaluate(u: number, v: number, tess: NDArray, uidx: number, vidx: number): void;
    tessellatePoints(resolution?: number): NDArray;
    tessellate(resolution?: number): {
        vertices: TypedArray;
        faces: number[];
    };
    static tessellateRecursive(bsrf: BSplineSurface, tolerance?: number): {
        vertices: TypedArray;
        faces: number[];
    }[];
    tessellateAdaptive(tolerance?: number): {
        vertices: TypedArray;
        faces: number[];
    }[];
    /**
     * Split this BSplineSurface into two at uk, by refining u-knots
     */
    splitU(uk: number): BSplineSurface[];
    /**
     * Split this BSplineSurface into two at vk, by refining v-knots
     */
    splitV(vk: number): BSplineSurface[];
    /**
     * Split this BSplineSurface into four
     */
    splitUV(uk: number, vk: number): BSplineSurface[];
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
