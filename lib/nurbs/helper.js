"use strict";
/*

 Copyright (C) 2017 Jayesh Salvi, Blue Math Software Inc.

 This file is part of Zector Math.

 Zector Math is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Zector Math is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with Zector Math.  If not, see <http://www.gnu.org/licenses/>.

 */
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("@bluemath/common");
/**
 * @hidden
 * Compute all n'th degree bernstein polynomials at given parameter value
 */
function bernstein(n, u) {
    var B = new Array(n + 1);
    B[0] = 1.0;
    var u1 = 1.0 - u;
    for (var j = 1; j <= n; j++) {
        var saved = 0.0;
        for (var k = 0; k < j; k++) {
            var temp = B[k];
            B[k] = saved + u1 * temp;
            saved = u * temp;
        }
        B[j] = saved;
    }
    return B;
}
exports.bernstein = bernstein;
/**
 * @hidden
 * Find the index of the knot span in which `u` lies
 * @param {number} p Degree
 * @param {Array.<number>} U Knot vector
 * @param {number} u Parameter
 * @returns {number}
 */
function findSpan(p, U, u) {
    var m = U.length - 1;
    var n = m - p - 1;
    if (common_1.isequal(u, U[n + 1])) {
        return n;
    }
    var low = p;
    var high = n + 1;
    var mid = Math.floor((low + high) / 2);
    while (u < U[mid] || u >= U[mid + 1]) {
        if (u < U[mid]) {
            high = mid;
        }
        else {
            low = mid;
        }
        mid = Math.floor((low + high) / 2);
    }
    return mid;
}
exports.findSpan = findSpan;
/**
 * @hidden
 * Evaluate basis function values
 * @param {number} p Degree
 * @param {Array.<number>} U Knot vector
 * @param {number} i Knot span index
 * @param {number} u Parameter
 * @returns {Array} Basis function values at i,u
 */
function getBasisFunction(p, U, i, u) {
    var N = new Array(p + 1);
    N[0] = 1.0;
    var left = new Array(p + 1);
    var right = new Array(p + 1);
    for (var j = 1; j <= p; j++) {
        left[j] = u - U[i + 1 - j];
        right[j] = U[i + j] - u;
        var saved = 0.0;
        for (var r = 0; r < j; r++) {
            var temp = N[r] / (right[r + 1] + left[j - r]);
            N[r] = saved + right[r + 1] * temp;
            saved = left[j - r] * temp;
        }
        N[j] = saved;
    }
    return N;
}
exports.getBasisFunction = getBasisFunction;
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
function getBasisFunctionDerivatives(p, u, ki, knots, n) {
    var U = knots.data;
    var ndu = common_1.empty([p + 1, p + 1]);
    var ders = common_1.empty([n + 1, p + 1]);
    ndu.set(0, 0, 1.0);
    var a = common_1.empty([2, p + 1]);
    var left = [];
    var right = [];
    for (var j = 1; j <= p; j++) {
        left[j] = u - U[ki + 1 - j];
        right[j] = U[ki + j] - u;
        var saved = 0.0;
        for (var r_1 = 0; r_1 < j; r_1++) {
            // Lower triangle
            ndu.set(j, r_1, right[r_1 + 1] + left[j - r_1]);
            var temp = ndu.getN(r_1, j - 1) / ndu.getN(j, r_1);
            // Upper triangle
            ndu.set(r_1, j, saved + right[r_1 + 1] * temp);
            saved = left[j - r_1] * temp;
        }
        ndu.set(j, j, saved);
    }
    for (var j = 0; j <= p; j++) {
        ders.set(0, j, ndu.get(j, p));
    }
    // This section computes the derivatives (eq 2.9)
    for (var r_2 = 0; r_2 <= p; r_2++) {
        var s1 = 0;
        var s2 = 1;
        // Alternate rows in array a
        a.set(0, 0, 1.0);
        for (var k = 1; k <= n; k++) {
            var d = 0.0;
            var rk = r_2 - k;
            var pk = p - k;
            if (r_2 >= k) {
                a.set(s2, 0, a.getN(s1, 0) / ndu.getN(pk + 1, rk));
                d = a.getN(s2, 0) * ndu.getN(rk, pk);
            }
            var j1 = void 0, j2 = void 0;
            if (rk >= -1) {
                j1 = 1;
            }
            else {
                j1 = -rk;
            }
            if (r_2 - 1 <= pk) {
                j2 = k - 1;
            }
            else {
                j2 = p - r_2;
            }
            for (var j = j1; j <= j2; j++) {
                a.set(s2, j, (a.getN(s1, j) - a.getN(s1, j - 1)) / ndu.getN(pk + 1, rk + j));
                d += a.getN(s2, j) * ndu.getN(rk + j, pk);
            }
            if (r_2 <= pk) {
                a.set(s2, k, -a.get(s1, k - 1) / ndu.getN(pk + 1, r_2));
                d += a.getN(s2, k) * ndu.getN(r_2, pk);
            }
            ders.set(k, r_2, d);
            // Switch rows
            var temp = s1;
            s1 = s2;
            s2 = temp;
        }
    }
    // Multiply through by the correct factors (eq 2.9)
    var r = p;
    for (var k = 1; k <= n; k++) {
        for (var j = 0; j <= p; j++) {
            ders.set(k, j, common_1.mul(ders.get(k, j), r));
        }
        r *= p - k;
    }
    return ders;
}
exports.getBasisFunctionDerivatives = getBasisFunctionDerivatives;
function blossom(cpoints, n, ts) {
    var b = cpoints.clone();
    if (ts.length !== n) {
        throw new Error("Number of parameters not equal to degee");
    }
    for (var r = 1; r < n + 1; r++) {
        var t = ts[r - 1];
        for (var i = 0; i < n + 1 - r; i++) {
            b.set(i, common_1.add(common_1.mul((1 - t), b.get(i)), common_1.mul(t, b.get(i + 1))));
        }
    }
    return b.get(0);
}
exports.blossom = blossom;
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
function planeFrom3Points(A, B, C) {
    if (A.shape.length !== 1 || B.shape.length !== 1 || C.shape.length !== 1) {
        throw new Error('A,B,C should be 1D position vectors, i.e. Point coord');
    }
    if (A.shape[0] !== 3 || B.shape[0] !== 3 || C.shape[0] !== 3) {
        throw new Error('A,B,C should be points in 3D space');
    }
    var AB = common_1.sub(B, A);
    var AC = common_1.sub(C, A);
    var n = common_1.dir(common_1.cross(AB, AC));
    var d = -common_1.dot(n, A);
    return [n.getN(0), n.getN(1), n.getN(2), d];
}
exports.planeFrom3Points = planeFrom3Points;
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
function intersectLineSegLineSeg3D(p1, p2, p3, p4) {
    if (p1.length !== 3 || p2.length !== 3 || p3.length !== 3 || p4.length !== 3) {
        throw new Error('All input points need to be 3D');
    }
    var pt1 = common_1.arr(p1);
    var pt2 = common_1.arr(p2);
    var pt3 = common_1.arr(p3);
    var pt4 = common_1.arr(p4);
    var p13 = common_1.sub(pt1, pt3);
    var p43 = common_1.sub(pt4, pt3);
    if (common_1.iszero(p43.getN(0)) && common_1.iszero(p43.getN(1)) && common_1.iszero(p43.getN(2))) {
        return null;
    }
    var p21 = common_1.sub(pt2, pt1);
    if (common_1.iszero(p21.getN(0)) && common_1.iszero(p21.getN(1)) && common_1.iszero(p21.getN(2))) {
        return null;
    }
    var d1343 = common_1.dot(p13, p43);
    var d4321 = common_1.dot(p43, p21);
    var d1321 = common_1.dot(p13, p21);
    var d4343 = common_1.dot(p43, p43);
    var d2121 = common_1.dot(p21, p21);
    var denom = d2121 * d4343 - d4321 * d4321;
    if (common_1.iszero(denom)) {
        return null;
    }
    var numer = d1343 * d4321 - d1321 * d4343;
    var mua = numer / denom;
    var mub = (d1343 + d4321 * mua) / d4343;
    var pa = common_1.add(pt1, common_1.mul(mua, p21));
    var pb = common_1.add(pt3, common_1.mul(mub, p43));
    // Line segment pa to pb represents shortest line segment between a and b
    // If it's of length zero, then ua, ub represent point of intersection
    // between the two lines
    if (common_1.iszero(common_1.length(common_1.sub(pb, pa)))) {
        return [mua, mub];
    }
    return null;
}
exports.intersectLineSegLineSeg3D = intersectLineSegLineSeg3D;
