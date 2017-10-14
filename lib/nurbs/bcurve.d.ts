import { NDArray, AABB } from '@bluemath/common';
/**
 * Rational or polynomial bezier curve
 * If the weights are specified it's a rational Bezier curve
 */
export declare class BezierCurve {
    degree: number;
    cpoints: NDArray;
    weights?: NDArray;
    constructor(degree: number, cpoints: NDArray, weights?: NDArray);
    /**
     * Dimension of the curve. Typically 2D or 3D
     */
    readonly dimension: number;
    /**
     * If the control points are defined in 2D plane, then add z=0 to each
     * of them to define them in 3D space
     */
    to3D(): void;
    /**
     * Is this Rational Bezier Curve
     */
    isRational(): boolean;
    /**
     * Evaluate the Bezier curve at given parameter value
     * Place the evaluated point in the `tess` array at `tessidx`
     */
    evaluate(u: number, tess?: NDArray, tessidx?: number): null;
    /**
     * Tessellate the Bezier curve uniformly at given resolution
     */
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
     * Tessellate bezier curve adaptively, within given tolerance of error
     */
    tessellateAdaptive(tolerance?: number): NDArray;
    /**
     * Checks if this Bezier curve is approximately a straight line within
     * given tolerance.
     */
    isLine(tolerance?: number): boolean;
    /**
     * Reparameterize the bezier curve within new parametric interval.
     * It uses the blossoming technique.
     */
    reparam(ua: number, ub: number): void;
    aabb(): AABB;
    clone(): BezierCurve;
    /**
     * Split into two Bezier curves at given parametric value
     */
    split(uk: number): BezierCurve[];
    toString(): string;
}
/**
 * Rational BSpline Curve
 */
export declare class BSplineCurve {
    degree: number;
    cpoints: NDArray;
    knots: NDArray;
    weights?: NDArray;
    constructor(degree: number, cpoints: NDArray, knots: NDArray, weights?: NDArray);
    /**
     * Determines how many dimension the curve occupies based on shape of
     * Control points array
     */
    readonly dimension: number;
    /**
     * Convert 2D control points to 3D
     */
    to3D(): void;
    /**
     * Split the curve at given parameter value and return two bspline
     * curves. The two curves put together will exactly represent the
     * original curve.
     */
    split(uk: number): BSplineCurve[];
    /**
     * Replace the knots of this BSplineCurve with new knots
     */
    setKnots(knots: NDArray): void;
    /**
     * Set the knot at given index in the knot vector
     */
    setKnot(index: number, knot: number): void;
    /**
     * Set the weight at given index
     */
    setWeight(index: number, weight: number): void;
    /**
     * Is this Rational BSpline Curve. Determined based on whether weights
     * were specified while constructing this BSplineCurve
     */
    isRational(): boolean;
    /**
     * Evaluate basis function derivatives upto n'th
     */
    private evaluateBasisDerivatives(span, n, t);
    private evaluateBasis(span, t);
    private findSpan(t);
    private getTermDenominator(span, N);
    /**
     * Tesselate basis functions uniformly at given resolution
     */
    tessellateBasis(resolution?: number): NDArray;
    private static tessBSpline(bcrv, tolerance);
    /**
     * Tessellate this BSplineCurve adaptively within given tolerance of error
     */
    tessellateAdaptive(tolerance?: number): NDArray;
    /**
     * Checks if this Bezier curve is approximately a straight line within
     * given tolerance.
     */
    isLine(tolerance?: number): boolean;
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
    /**
     * Evaluate the BSplineCurve at given parameter value
     * If `tess` parameter is provided then the evaluated value is
     * placed in the `tess` array at index `tessidx`. Otherwise the single
     * euclidean point is returned.
     */
    evaluate(t: number, tess?: NDArray, tessidx?: number): NDArray | null;
    /**
     * Evaluate the derivative of BSplineCurve at given parameter value
     * If `tess` parameter is provided then the evaluated value is
     * placed in the `tess` array at index `tessidx`. Otherwise the single
     * euclidean point is returned.
     */
    evaluateDerivative(t: number, d: number, tess?: NDArray, tessidx?: number): NDArray | null;
    /**
     * Tessellate the BSplineCurve uniformly at given resolution
     */
    tessellate(resolution?: number): NDArray;
    /**
     * Tessellate derivatives of BSplineCurve uniformly at given resolution
     */
    tessellateDerivatives(resolution: number | undefined, d: number): NDArray;
    clone(): BSplineCurve;
    aabb(): AABB;
    toString(): string;
}
