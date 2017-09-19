import { NDArray, TypedArray } from '@bluemath/common';
/**
 * @hidden
 * Compute all n'th degree bernstein polynomials at given parameter value
 */
declare function bernstein(n: number, u: number): Array<number>;
/**
 * @hidden
 * Find the index of the knot span in which `u` lies
 * @param {number} p Degree
 * @param {Array.<number>} U Knot vector
 * @param {number} u Parameter
 * @returns {number}
 */
declare function findSpan(p: number, U: Array<number> | TypedArray, u: number): number;
/**
 * @hidden
 * Evaluate basis function values
 * @param {number} p Degree
 * @param {Array.<number>} U Knot vector
 * @param {number} i Knot span index
 * @param {number} u Parameter
 * @returns {Array} Basis function values at i,u
 */
declare function getBasisFunction(p: number, U: Array<number> | TypedArray, i: number, u: number): Array<number>;
/**
 * @hidden
 * The NURBS book Algo A2.3
 * Compute non-zero basis functions and their derivatives, upto and including
 * n'th derivative (n <= p). Output is 2-dimensional array `ders`
 * @param {number} p Degree
 * @param {number} u Parameter
 * @param {number} i Knot span
 * @param {NDArray} knots Knot vector
 * @param {number} n nth derivative
 * @returns {NDArray} ders ders[k][j] is k'th derivative of
 *            basic function N(i-p+j,p), where 0<=k<=n and 0<=j<=p
 */
declare function getBasisFunctionDerivatives(p: number, u: number, ki: number, knots: NDArray, n: number): NDArray;
declare function blossom(cpoints: NDArray, n: number, ts: number[]): NDArray;
/**
 * Computes equation of plane passing through given 3 points
 * Eqn of plane is
 *  ax + by + cz + d = 0
 * This routine returns [a,b,c,d]
 * The direction of the normal is defined by assuming that A,B,C are in
 * counter-clockwise direction. i.e. if you curl fingers of right hand
 * in counter-clockwise direction, then the raised thumb will give the
 * direction of the plane normal
 */
declare function planeFrom3Points(A: NDArray, B: NDArray, C: NDArray): number[];
/**
 * Finds intersection between two line segments in 3D
 * First line segment extends from p1 to p2, and second extends from p3 to p4
 * Input points are assumed to be coordinates in 3D coord system
 *
 * Algorithm based on C implemention by Paul Bourke
 * http://paulbourke.net/geometry/pointlineplane/lineline.c
 *
 * The method will return a tuple with results (ua, ub),
 * where u is the parameter value on each line
 * If there is no intersection null will be returned
 */
declare function intersectLineSegLineSeg3D(p1: number[], p2: number[], p3: number[], p4: number[]): null | number[];
export { bernstein, findSpan, getBasisFunction, getBasisFunctionDerivatives, blossom, planeFrom3Points, intersectLineSegLineSeg3D };
