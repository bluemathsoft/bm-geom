import { NDArray, AABB } from '@bluemath/common';
import { CoordSystem } from '..';
export declare class BezierCurve {
    degree: number;
    cpoints: NDArray;
    weights?: NDArray;
    constructor(degree: number, cpoints: NDArray, weights?: NDArray);
    readonly dimension: number;
    /**
     * Is this Rational Bezier Curve
     */
    isRational(): boolean;
    evaluate(u: number, tess?: NDArray, tessidx?: number): null;
    tessellate(resolution?: number): NDArray;
    /**
     * The curve is subdivided into two curves at the mipoint of parameter
     * range. This is done recursively until the curve becomes a straight line
     * within given tolerance.
     * The subdivision involves reparameterizing the curve, which is done using
     * blossoming or deCasteljau formula.
     */
    private static tessBezier(bezcrv, tolerance);
    /**
     * Compute adaptive tessellation of the curve
     */
    tessellateAdaptive(tolerance?: number): NDArray;
    /**
     * Checks if this Bezier curve is approximately a straight line within
     * given tolerance.
     * The check works by constructing a line between first and last control
     * point and then finding the distance of other control points from this
     * line. Instead of actually calculating the distance from the line, we
     * do the check if the point lies on the line or not. This is done by
     * substituting the [x,y] coordinates of control point, into the equation
     * of the line. If the result is zero within the tolerance value, then
     * the control point lies on the line. If all control points lie on the line
     * then the curve can be considered a straight line.
     */
    isLine(tolerance?: number): boolean;
    computeZeroCurvatureLocations(): void;
    reparam(ua: number, ub: number): void;
    aabb(): AABB;
    clone(): BezierCurve;
    toString(): string;
}
/**
 * @hidden
 */
export declare class BSplineCurve {
    degree: number;
    cpoints: NDArray;
    knots: NDArray;
    weights?: NDArray;
    constructor(degree: number, cpoints: NDArray, knots: NDArray, weights?: NDArray);
    readonly dimension: number;
    /**
     * Split the curve at given parameter value and return two bspline
     * curves. The two curves put together will exactly represent the
     * original curve.
     */
    split(uk: number): BSplineCurve[];
    setKnots(knots: NDArray): void;
    setKnot(index: number, knot: number): void;
    setWeight(index: number, weight: number): void;
    /**
     * Is this Rational BSpline Curve
     */
    isRational(): boolean;
    /**
     * Evaluate basis function derivatives upto n'th
     */
    evaluateBasisDerivatives(span: number, n: number, t: number): NDArray;
    evaluateBasis(span: number, t: number): number[];
    findSpan(t: number): number;
    protected getTermDenominator(span: number, N: number[]): number;
    tessellateBasis(resolution?: number): NDArray;
    /**
     * Inserts knot un in the knot vector r-times
     * Algorithm A5.1 from "The NURBS Book"
     */
    insertKnot(un: number, r: number): void;
    /**
     * Inserts multiple knots into the knot vector at once
     * Algorithm A5.4 from "The NURBS Book"
     * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
     */
    refineKnots(ukList: number[]): void;
    /**
     * Algorithm A5.6 from "The NURBS Book"
     * The total number of bezier segments required to decompose a
     * given bspline curve
     *  = Number of internal knots + 1
     *  = Length of knot vector - 2*(p+1) + 1
     *  = (m+1) - 2*(p+1) + 1
     *  = m - 2*p
     * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
     */
    decompose(): BezierCurve[];
    evaluate(t: number, tess?: NDArray, tessidx?: number): NDArray | null;
    evaluateDerivative(t: number, d: number, tess?: NDArray, tessidx?: number): NDArray | null;
    tessellate(resolution?: number): NDArray;
    tessellateDerivatives(resolution: number | undefined, d: number): NDArray;
    clone(): BSplineCurve;
    aabb(): AABB;
    toString(): string;
}
export declare class LineSegment extends BSplineCurve {
    constructor(from: number[], to: number[]);
}
export declare class CircleArc extends BSplineCurve {
    constructor(coordsys: CoordSystem, radius: number, start: number, end: number);
}
export declare class Circle extends CircleArc {
    constructor(coord: CoordSystem, radius: number);
}
