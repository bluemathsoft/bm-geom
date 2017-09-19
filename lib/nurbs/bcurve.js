"use strict";
/*

Copyright (C) 2017 Jayesh Salvi, Blue Math Software Inc.

This file is part of bluemath.

bluemath is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

bluemath is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with bluemath. If not, see <http://www.gnu.org/licenses/>.

*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var helper_1 = require("./helper");
var common_1 = require("@bluemath/common");
var BezierCurve = /** @class */ (function () {
    function BezierCurve(degree, cpoints, weights) {
        this.degree = degree;
        if (!cpoints.is2D()) {
            throw new Error("cpoints is not an array of points");
        }
        this.cpoints = cpoints;
        if (weights) {
            console.assert(weights.length === degree + 1);
        }
        this.weights = weights;
    }
    Object.defineProperty(BezierCurve.prototype, "dimension", {
        get: function () {
            return this.cpoints.shape[1];
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Is this Rational Bezier Curve
     */
    BezierCurve.prototype.isRational = function () {
        return !!this.weights;
    };
    BezierCurve.prototype.evaluate = function (u, tess, tessidx) {
        var B = helper_1.bernstein(this.degree, u);
        var dim = this.dimension;
        var denominator;
        if (this.weights) {
            denominator = 0;
            for (var i = 0; i < this.degree + 1; i++) {
                denominator += B[i] * this.weights.get(i);
            }
        }
        else {
            denominator = 1;
        }
        if (tess !== undefined && tessidx !== undefined) {
            for (var k = 0; k < this.degree + 1; k++) {
                if (this.weights) {
                    for (var z = 0; z < dim; z++) {
                        tess.set(tessidx, z, tess.get(tessidx, z) +
                            B[k] * this.cpoints.get(k, z) *
                                this.weights.get(k));
                    }
                }
                else {
                    for (var z = 0; z < dim; z++) {
                        tess.set(tessidx, z, tess.get(tessidx, z) +
                            B[k] * this.cpoints.get(k, z));
                    }
                }
            }
            for (var z = 0; z < dim; z++) {
                tess.set(tessidx, z, tess.get(tessidx, z) / denominator);
            }
            return null;
        }
        else {
            throw new Error('Not implemented');
        }
    };
    BezierCurve.prototype.tessellate = function (resolution) {
        if (resolution === void 0) { resolution = 10; }
        var tess = new common_1.NDArray({
            shape: [resolution + 1, this.dimension],
            datatype: 'f32'
        });
        for (var i = 0; i < resolution + 1; i++) {
            this.evaluate(i / resolution, tess, i);
        }
        return tess;
    };
    /**
     * The curve is subdivided into two curves at the mipoint of parameter
     * range. This is done recursively until the curve becomes a straight line
     * within given tolerance.
     * The subdivision involves reparameterizing the curve, which is done using
     * blossoming or deCasteljau formula.
     */
    BezierCurve.tessBezier = function (bezcrv, tolerance) {
        if (bezcrv.isLine(tolerance)) {
            return [
                bezcrv.cpoints.getA(0).toArray(),
                bezcrv.cpoints.getA(bezcrv.cpoints.length - 1).toArray()
            ];
        }
        else {
            var left = bezcrv.clone();
            left.reparam(0, 0.5);
            var right = bezcrv.clone();
            right.reparam(0.5, 1);
            var tessLeft = BezierCurve.tessBezier(left, tolerance);
            var tessRight = BezierCurve.tessBezier(right, tolerance);
            // last point of tessLeft must be same as first point of tessRight
            tessLeft.pop();
            return tessLeft.concat(tessRight);
        }
    };
    /**
     * Compute adaptive tessellation of the curve
     */
    BezierCurve.prototype.tessellateAdaptive = function (tolerance) {
        if (tolerance === void 0) { tolerance = common_1.EPSILON; }
        return new common_1.NDArray(BezierCurve.tessBezier(this, tolerance));
    };
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
    BezierCurve.prototype.isLine = function (tolerance) {
        if (tolerance === void 0) { tolerance = 1e-6; }
        if (this.dimension !== 2) {
            throw new Error("isFlat check only supported for 2D Bezier curves");
        }
        if (this.degree === 1) {
            return true;
        }
        var x0 = this.cpoints.getN(0, 0);
        var y0 = this.cpoints.getN(0, 1);
        var xn = this.cpoints.getN(this.cpoints.length - 1, 0);
        var yn = this.cpoints.getN(this.cpoints.length - 1, 1);
        var A = yn - y0;
        var B = xn - x0;
        for (var i = 1; i < this.cpoints.length - 1; i++) {
            var x = this.cpoints.getN(i, 0);
            var y = this.cpoints.getN(i, 1);
            // From the equation of the line of the form
            // y-mx-c = 0
            var value = y - (A / B) * x - (y0 - (A / B) * x0);
            if (!common_1.iszero(value, tolerance)) {
                return false;
            }
        }
        return true;
    };
    // Experimental. WIP
    BezierCurve.prototype.computeZeroCurvatureLocations = function () {
        if (this.degree !== 3) {
            throw new Error("This mathod only supports only cubic bezier curves");
        }
        // let [x0,y0] = (<NDArray>this.cpoints.get(0)).data;
        // let [x1,y1] = (<NDArray>this.cpoints.get(1)).data;
        // let [x2,y2] = (<NDArray>this.cpoints.get(2)).data;
        // let [x3,y3] = (<NDArray>this.cpoints.get(3)).data;
        // return [
        //   (2/3) * (x0-3*x1+0.5*x2)/(x0-3*x1+3*x2-x3),
        //   (2/3) * (y0-3*y1+0.5*y2)/(y0-3*y1+3*y2-y3),
        // ]
    };
    BezierCurve.prototype.reparam = function (ua, ub) {
        var n = this.degree;
        var b = new common_1.NDArray({ shape: this.cpoints.shape });
        for (var i = 0; i < n + 1; i++) {
            var ts = [];
            for (var k = 0; k < n - i; k++) {
                ts.push(ua);
            }
            for (var k = 0; k < i; k++) {
                ts.push(ub);
            }
            b.set(i, helper_1.blossom(this.cpoints, n, ts));
        }
        this.cpoints = b;
    };
    BezierCurve.prototype.aabb = function () {
        var aabb = new common_1.AABB(this.dimension);
        for (var i = 0; i < this.cpoints.length; i++) {
            var cpoint = this.cpoints.get(i);
            aabb.update(cpoint);
        }
        return aabb;
    };
    BezierCurve.prototype.clone = function () {
        return new BezierCurve(this.degree, this.cpoints.clone(), this.weights ? this.weights.clone() : undefined);
    };
    BezierCurve.prototype.toString = function () {
        var s = "Bezier(Deg " + this.degree + " cpoints " + this.cpoints.toString() + ")";
        if (this.weights) {
            s += " weights " + this.weights.toString();
        }
        return s;
    };
    return BezierCurve;
}());
exports.BezierCurve = BezierCurve;
/**
 * @hidden
 */
var BSplineCurve = /** @class */ (function () {
    function BSplineCurve(degree, cpoints, knots, weights) {
        this.degree = degree;
        console.assert(cpoints.is2D());
        this.cpoints = cpoints;
        console.assert(knots.is1D());
        this.knots = knots;
        if (weights) {
            console.assert(knots.is1D());
        }
        this.weights = weights;
        /*
         The degree p, number of control points n+1, number of knots m+1
         are related by
         m = n + p + 1
         [The NURBS book, P3.1]
         */
        var p = degree;
        var m = knots.shape[0] - 1;
        var n = cpoints.shape[0] - 1;
        console.assert(m === n + p + 1);
    }
    Object.defineProperty(BSplineCurve.prototype, "dimension", {
        get: function () {
            return this.cpoints.shape[1];
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Split the curve at given parameter value and return two bspline
     * curves. The two curves put together will exactly represent the
     * original curve.
     */
    BSplineCurve.prototype.split = function (uk) {
        var r = this.degree;
        // Count number of times uk already occurs in the knot vector
        // We have to add uk until it occurs p-times in the knot vector,
        // where p is the degree of the curve
        // In case there are knots in the knot vector that are equal to uk,
        // within the error tolerance, then we replace those knots with uk
        // Such knot vector is named safeknots.
        var safeknots = [];
        for (var i = 0; i < this.knots.data.length; i++) {
            if (common_1.isequal(this.knots.getN(i), uk)) {
                safeknots.push(uk);
                r--;
            }
            else {
                safeknots.push(this.knots.getN(i));
            }
        }
        var addknots = [];
        for (var i = 0; i < r; i++) {
            addknots.push(uk);
        }
        var copy = this.clone();
        copy.setKnots(common_1.arr(safeknots));
        copy.refineKnots(addknots);
        // Find the index of the first uk knot in the new knot vector
        var ibreak = -1;
        for (var i = 0; i < copy.knots.data.length; i++) {
            if (common_1.isequal(copy.knots.getN(i), uk)) {
                ibreak = i;
                break;
            }
        }
        console.assert(ibreak >= 0);
        // The control point on the curve, where the split will happen is
        // at index ibreak-1 in the control points array (found by observation)
        // The left curve will have ibreak control points and
        // right curve will have N-ibreak+1 control points
        // (where N is number of control point in original curve)
        // The control point at ibreak-1 will be repeated in left and right curves
        // It will be the last control point of left and first control point of
        // right curve.
        var lcpoints = copy.cpoints.getA(':' + ibreak);
        var rcpoints = copy.cpoints.getA((ibreak - 1) + ':');
        var lknots = copy.knots.getA(':' + ibreak).toArray();
        // Scale the internal knot values, to fit into left curve 0-1 param range
        for (var i = copy.degree + 1; i < lknots.length; i++) {
            lknots[i] = lknots[i] / uk;
        }
        // Append clamped knots to the left curve at 1
        for (var i = 0; i <= copy.degree; i++) {
            lknots.push(1);
        }
        var rknots = copy.knots.getA((ibreak + copy.degree) + ':').toArray();
        // Scale the internal knot values, to fit into right curve 0-1 param range
        for (var i = 0; i < rknots.length - copy.degree; i++) {
            rknots[i] = (rknots[i] - uk) / (1 - uk);
        }
        // Prepend clamped knots to the right curve at 0
        for (var i = 0; i <= copy.degree; i++) {
            rknots.unshift(0);
        }
        // TODO : Rational
        var lcurve = new BSplineCurve(copy.degree, lcpoints, common_1.arr(lknots));
        var rcurve = new BSplineCurve(copy.degree, rcpoints, common_1.arr(rknots));
        return [lcurve, rcurve];
    };
    BSplineCurve.prototype.setKnots = function (knots) {
        if (!this.knots.isShapeEqual(knots)) {
            throw new Error('Invalid knot vector length');
        }
        this.knots = knots;
    };
    BSplineCurve.prototype.setKnot = function (index, knot) {
        if (index >= this.knots.shape[0] || index < 0) {
            throw new Error('Invalid knot index');
        }
        if (knot < 0 || knot > 1) {
            throw new Error('Invalid knot value');
        }
        if (index < this.degree + 1) {
            if (knot !== 0) {
                throw new Error('Clamped knot has to be zero');
            }
        }
        if (index >= (this.knots.shape[0] - this.degree - 1)) {
            if (knot !== 1) {
                throw new Error('Clamped knot has to be one');
            }
        }
        this.knots.set(index, knot);
    };
    BSplineCurve.prototype.setWeight = function (index, weight) {
        if (!this.weights) {
            throw new Error('Not a Rational BSpline');
        }
        if (index < 0 || index >= this.weights.shape[0]) {
            throw new Error('Index out of bounds');
        }
        this.weights.set(index, weight);
    };
    /**
     * Is this Rational BSpline Curve
     */
    BSplineCurve.prototype.isRational = function () {
        return !!this.weights;
    };
    /**
     * Evaluate basis function derivatives upto n'th
     */
    BSplineCurve.prototype.evaluateBasisDerivatives = function (span, n, t) {
        return helper_1.getBasisFunctionDerivatives(this.degree, t, span, this.knots, n);
    };
    BSplineCurve.prototype.evaluateBasis = function (span, t) {
        return helper_1.getBasisFunction(this.degree, this.knots.data, span, t);
    };
    BSplineCurve.prototype.findSpan = function (t) {
        return helper_1.findSpan(this.degree, this.knots.data, t);
    };
    BSplineCurve.prototype.getTermDenominator = function (span, N) {
        var p = this.degree;
        var denominator;
        if (this.weights) {
            denominator = 0.0;
            for (var i = 0; i < N.length; i++) {
                denominator += N[i] * this.weights.get(span - p + i);
            }
        }
        else {
            denominator = 1.0;
        }
        return denominator;
    };
    BSplineCurve.prototype.tessellateBasis = function (resolution) {
        if (resolution === void 0) { resolution = 10; }
        var n = this.cpoints.shape[0] - 1;
        var p = this.degree;
        var Nip = common_1.zeros([n + 1, resolution + 1], 'f32');
        for (var i = 0; i < resolution + 1; i++) {
            var u = i / resolution;
            var span = this.findSpan(u);
            var N = this.evaluateBasis(span, u);
            for (var j = p; j >= 0; j--) {
                Nip.set(span - j, i, N[p - j]);
            }
        }
        return Nip;
    };
    /**
     * Inserts knot un in the knot vector r-times
     * Algorithm A5.1 from "The NURBS Book"
     */
    BSplineCurve.prototype.insertKnot = function (un, r) {
        var p = this.degree;
        var dim = this.dimension;
        var k = this.findSpan(un);
        var isRational = this.isRational();
        // If un already exists in the knot vector then s is it's multiplicity
        var s = 0;
        for (var i = 0; i < this.knots.shape[0]; i++) {
            if (this.knots.get(i) === un) {
                s++;
            }
        }
        if (r + s >= p) {
            throw new Error('Knot insertion exceeds knot multiplicity beyond degree');
        }
        var m = this.knots.shape[0] - 1;
        var n = m - p - 1;
        var P = this.cpoints;
        var Up = this.knots;
        var Q = new common_1.NDArray({ shape: [P.shape[0] + r, dim] });
        var Uq = new common_1.NDArray({ shape: [Up.shape[0] + r] });
        var Rtmp, Wtmp;
        Rtmp = new common_1.NDArray({ shape: [p + 1, dim] });
        var Wp, Wq;
        if (this.weights) {
            Wp = this.weights;
            Wq = new common_1.NDArray({ shape: [Wp.shape[0] + r] });
            Wtmp = new common_1.NDArray({ shape: [p + 1] });
        }
        // Load new knot vector
        for (var i = 0; i < k + 1; i++) {
            Uq.set(i, Up.get(i));
        }
        for (var i = 1; i < r + 1; i++) {
            Uq.set(k + i, un);
        }
        for (var i = k + 1; i < m + 1; i++) {
            Uq.set(i + r, Up.get(i));
        }
        // Save unaltered control points
        for (var i = 0; i < k - p + 1; i++) {
            for (var j = 0; j < dim; j++) {
                Q.set(i, j, P.get(i, j));
            }
            if (Wp && Wq) {
                Wq.set(i, Wp.get(i));
            }
        }
        for (var i = k - s; i < n + 1; i++) {
            for (var j = 0; j < dim; j++) {
                Q.set(i + r, j, P.get(i, j));
            }
            if (Wp && Wq) {
                Wq.set(i + r, Wp.get(i));
            }
        }
        for (var i = 0; i < p - s + 1; i++) {
            for (var j = 0; j < dim; j++) {
                Rtmp.set(i, j, P.get(k - p + i, j));
            }
        }
        var L = 0;
        for (var j = 1; j < r + 1; j++) {
            L = k - p + j;
            for (var i = 0; i < p - j - s + 1; i++) {
                var alpha = (un - Up.get(L + i)) / (Up.get(i + k + 1) - Up.get(L + i));
                for (var z = 0; z < dim; z++) {
                    Rtmp.set(i, z, alpha * Rtmp.get(i + 1, z) + (1 - alpha) * Rtmp.get(i, z));
                }
                if (Wtmp) {
                    Wtmp.set(i, alpha * Wtmp.get(i + 1) + (1 - alpha) * Wtmp.get(i));
                }
            }
            for (var z = 0; z < dim; z++) {
                Q.set(L, z, Rtmp.get(0, z));
                Q.set(k + r - j - s, z, Rtmp.get(p - j - s, z));
            }
            if (Wq && Wtmp) {
                Wq.set(L, Wtmp.get(0));
                Wq.set(k + r - j - s, Wtmp.get(p - j - s));
            }
        }
        for (var i = L + 1; i < k - s + 1; i++) {
            for (var z = 0; z < dim; z++) {
                Q.set(i, z, Rtmp.get(i - L, z));
            }
            if (Wq && Wtmp) {
                Wq.set(i, Wtmp.get(i - L));
            }
        }
        this.knots = Uq;
        this.cpoints = Q;
        if (isRational) {
            this.weights = Wq;
        }
    };
    /**
     * Inserts multiple knots into the knot vector at once
     * Algorithm A5.4 from "The NURBS Book"
     * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
     */
    BSplineCurve.prototype.refineKnots = function (ukList) {
        var m = this.knots.length - 1;
        var p = this.degree;
        var n = m - p - 1;
        var dim = this.dimension;
        var X = ukList;
        var r = ukList.length - 1;
        var P = this.cpoints;
        var Q = new common_1.NDArray({ shape: [P.length + r + 1, dim] });
        var U = this.knots;
        var Ubar = new common_1.NDArray({ shape: [U.length + r + 1] });
        var Wp, Wq;
        if (this.weights) {
            Wq = new common_1.NDArray({ shape: [P.length + r + 1] });
            Wp = this.weights;
        }
        var a = this.findSpan(X[0]);
        var b = this.findSpan(X[r]);
        b += 1;
        // Copy control points and weights for u < a and u > b
        for (var j = 0; j < a - p + 1; j++) {
            for (var k_1 = 0; k_1 < dim; k_1++) {
                Q.set(j, k_1, P.get(j, k_1));
            }
            if (Wp && Wq) {
                Wq.set(j, Wp.get(j));
            }
        }
        for (var j = b - 1; j < n + 1; j++) {
            for (var k_2 = 0; k_2 < dim; k_2++) {
                Q.set(j + r + 1, k_2, P.get(j, k_2));
            }
            if (Wp && Wq) {
                Wq.set(j + r + 1, Wp.get(j));
            }
        }
        // Copy knots for u < a and u > b
        for (var j = 0; j < a + 1; j++) {
            Ubar.set(j, U.get(j));
        }
        for (var j = b + p; j < m + 1; j++) {
            Ubar.set(j + r + 1, U.get(j));
        }
        // For values of u between a and b
        var i = b + p - 1;
        var k = b + p + r;
        for (var j = r; j >= 0; j--) {
            while (X[j] <= U.get(i) && i > a) {
                for (var z = 0; z < dim; z++) {
                    Q.set(k - p - 1, z, P.get(i - p - 1, z));
                }
                if (Wp && Wq) {
                    Wq.set(k - p - 1, Wp.get(i - p - 1));
                }
                Ubar.set(k, U.get(i));
                k -= 1;
                i -= 1;
            }
            for (var z = 0; z < dim; z++) {
                Q.set(k - p - 1, z, Q.get(k - p, z));
            }
            if (Wp && Wq) {
                Wq.set(k - p - 1, Wq.get(k - p));
            }
            for (var l = 1; l < p + 1; l++) {
                var ind = k - p + l;
                var alpha = Ubar.get(k + l) - X[j];
                if (Math.abs(alpha) === 0.0) {
                    for (var z = 0; z < dim; z++) {
                        Q.set(ind - 1, z, Q.get(ind, z));
                    }
                    if (Wp && Wq) {
                        Wq.set(ind - 1, Wq.get(ind));
                    }
                }
                else {
                    alpha = alpha / (Ubar.get(k + l) - U.get(i - p + l));
                    for (var z = 0; z < dim; z++) {
                        Q.set(ind - 1, z, alpha * Q.get(ind - 1, z) +
                            (1.0 - alpha) * Q.get(ind, z));
                    }
                    if (Wq) {
                        Wq.set(ind - 1, alpha * Wq.get(ind - 1) +
                            (1.0 - alpha) * Wq.get(ind));
                    }
                }
            }
            Ubar.set(k, X[j]);
            k -= 1;
        }
        this.knots = Ubar;
        this.cpoints = Q;
        if (this.weights) {
            this.weights = Wq;
        }
    };
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
    BSplineCurve.prototype.decompose = function () {
        var p = this.degree;
        var U = this.knots;
        var m = U.length - 1;
        var P = this.cpoints;
        var dim = this.dimension;
        var alphas = new common_1.NDArray({ shape: [p] });
        var a = p;
        var b = p + 1;
        var total_bezier = m - 2 * p;
        var Q = new common_1.NDArray({ shape: [total_bezier, p + 1, dim] });
        var nb = 0; // Counter for Bezier segments
        for (var i_1 = 0; i_1 < p + 1; i_1++) {
            for (var z = 0; z < dim; z++) {
                Q.set(nb, i_1, z, P.get(i_1, z));
            }
        }
        var i;
        while (b < m) {
            i = b;
            while (b < m && U.get(b + 1) === U.get(b)) {
                b += 1;
            }
            var mult = b - i + 1;
            if (mult < p) {
                var numerator = U.get(b) - U.get(a);
                // Compute and store alphas
                for (var j = p; j > mult; j--) {
                    alphas.set(j - mult - 1, numerator / (U.get(a + j) - U.get(a)));
                }
                var r = p - mult; // Insert knot r times
                for (var j = 1; j < r + 1; j++) {
                    var save = r - j;
                    var s = mult + j; // This many new points
                    for (var k = p; k > s - 1; k--) {
                        var alpha = alphas.get(k - s);
                        for (var z = 0; z < dim; z++) {
                            Q.set(nb, k, z, alpha * Q.get(nb, k, z) +
                                (1.0 - alpha) * Q.get(nb, k - 1, z));
                        }
                    }
                    if (b < m) {
                        for (var z = 0; z < dim; z++) {
                            Q.set(nb + 1, save, z, Q.get(nb, p, z));
                        }
                    }
                }
            }
            nb += 1;
            if (b < m) {
                for (var i_2 = p - mult; i_2 < p + 1; i_2++) {
                    for (var z = 0; z < dim; z++) {
                        Q.set(nb, i_2, z, P.get(b - p + i_2, z));
                    }
                }
                a = b;
                b += 1;
            }
        }
        var bezlist = [];
        for (var i_3 = 0; i_3 < Q.length; i_3++) {
            bezlist.push(new BezierCurve(p, Q.get(i_3).reshape([p + 1, dim])));
        }
        return bezlist;
    };
    BSplineCurve.prototype.evaluate = function (t, tess, tessidx) {
        var p = this.degree;
        var span = this.findSpan(t);
        var dim = this.dimension;
        var N = this.evaluateBasis(span, t);
        var denominator = this.getTermDenominator(span, N);
        if (tess) {
            tessidx = tessidx || 0;
            for (var i = 0; i < p + 1; i++) {
                var K = void 0;
                if (this.weights) {
                    K = N[i] * this.weights.get(span - p + i) / denominator;
                }
                else {
                    K = N[i] / denominator;
                }
                for (var z = 0; z < dim; z++) {
                    var c = this.cpoints.get(span - p + i, z);
                    tess.set(tessidx, z, tess.get(tessidx, z) + K * c);
                }
            }
            return null;
        }
        else {
            var point = new common_1.NDArray({ shape: [dim] });
            for (var i = 0; i < p + 1; i++) {
                var K = void 0;
                if (this.weights) {
                    K = N[i] * this.weights.get(span - p + i) / denominator;
                }
                else {
                    K = N[i] / denominator;
                }
                for (var z = 0; z < dim; z++) {
                    var c = this.cpoints.get(span - p + i, z);
                    point.set(z, point.get(z) + K * c);
                }
            }
            return point;
        }
    };
    BSplineCurve.prototype.evaluateDerivative = function (t, d, tess, tessidx) {
        var p = this.degree;
        var P = this.cpoints;
        var du = Math.min(d, p);
        var ders = common_1.zeros([du + 1, 2]);
        var span = this.findSpan(t);
        var Nders = this.evaluateBasisDerivatives(span, du, t);
        for (var k = 0; k < du + 1; k++) {
            ders.set(k, common_1.zeros(2));
            for (var j = 0; j < p + 1; j++) {
                ders.set(k, common_1.add(ders.getA(k), common_1.mul(Nders.getN(k, j), P.getA(span - p + j))));
            }
        }
        if (tess && tessidx !== undefined) {
            for (var i = 0; i < du + 1; i++) {
                tess.set(tessidx, i, ders.getA(i));
            }
            return null;
        }
        else {
            throw new Error('Not implemented');
        }
    };
    BSplineCurve.prototype.tessellate = function (resolution) {
        if (resolution === void 0) { resolution = 10; }
        var tess = new common_1.NDArray({
            shape: [resolution + 1, this.dimension],
            datatype: 'f32'
        });
        for (var i = 0; i < resolution + 1; i++) {
            this.evaluate(i / resolution, tess, i);
        }
        return tess;
    };
    BSplineCurve.prototype.tessellateDerivatives = function (resolution, d) {
        if (resolution === void 0) { resolution = 10; }
        var tess = new common_1.NDArray({
            shape: [resolution + 1, d, this.dimension],
            datatype: 'f32'
        });
        for (var i = 0; i < resolution + 1; i++) {
            this.evaluateDerivative(i / resolution, d, tess, i);
        }
        return tess;
    };
    BSplineCurve.prototype.clone = function () {
        return new BSplineCurve(this.degree, this.cpoints.clone(), this.knots.clone(), this.weights ? this.weights.clone() : undefined);
    };
    BSplineCurve.prototype.aabb = function () {
        var aabb = new common_1.AABB(this.dimension);
        for (var i = 0; i < this.cpoints.length; i++) {
            var cpoint = this.cpoints.get(i);
            aabb.update(cpoint);
        }
        return aabb;
    };
    BSplineCurve.prototype.toString = function () {
        var s = "BSpline(Deg " + this.degree + " cpoints " + this.cpoints.toString() + ")";
        s += " knots " + this.knots.toString();
        if (this.weights) {
            s += " weights " + this.weights.toString();
        }
        return s;
    };
    return BSplineCurve;
}());
exports.BSplineCurve = BSplineCurve;
var LineSegment = /** @class */ (function (_super) {
    __extends(LineSegment, _super);
    function LineSegment(from, to) {
        return _super.call(this, 1, common_1.arr([from, to]), common_1.arr([0, 0, 1, 1])) || this;
    }
    return LineSegment;
}(BSplineCurve));
exports.LineSegment = LineSegment;
var CircleArc = /** @class */ (function (_super) {
    __extends(CircleArc, _super);
    function CircleArc(coordsys, radius, start, end) {
        var _this = this;
        var O = coordsys.origin;
        var X = coordsys.x;
        var Y = coordsys.y;
        if (end < start) {
            end = end + 2 * Math.PI;
        }
        var theta = end - start;
        var narcs;
        if (theta <= Math.PI / 2) {
            narcs = 1;
        }
        else if (theta <= Math.PI) {
            narcs = 2;
        }
        else if (theta <= 3 * Math.PI / 2) {
            narcs = 3;
        }
        else {
            narcs = 4;
        }
        var dtheta = theta / narcs;
        var n = 2 * narcs; // n+1 control points
        var p = 2; // Degree
        var m = n + p + 1;
        var U = new common_1.NDArray({ shape: [m + 1] });
        var P = new common_1.NDArray({ shape: [n + 1, 3] });
        var wt = new common_1.NDArray({ shape: [n + 1] });
        var w1 = Math.cos(dtheta / 2); // dtheta/2 is the base angle
        var P0 = common_1.add(O, common_1.add(common_1.mul(radius, Math.cos(start), X), common_1.mul(radius, Math.sin(start), Y)));
        var T0 = common_1.add(common_1.mul(-Math.sin(start), X), common_1.mul(Math.cos(start), Y));
        P.set(0, P0);
        wt.set(0, 1);
        var index = 0;
        var angle = start;
        for (var i = 1; i < narcs + 1; i++) {
            angle += dtheta;
            var P2 = common_1.add(O, common_1.mul(radius, Math.cos(angle), X), common_1.mul(radius, Math.sin(angle), Y));
            P.set(index + 2, P2);
            wt.set(index + 2, 1);
            var T2 = common_1.add(common_1.mul(-Math.sin(angle), X), common_1.mul(Math.cos(angle), Y));
            var isect = helper_1.intersectLineSegLineSeg3D(P0.toArray(), common_1.add(P0, T0).toArray(), P2.toArray(), common_1.add(P2, T2).toArray());
            if (!isect) {
                throw new Error('Intersection in 3D failed');
            }
            var pti = common_1.add(P0, common_1.mul(T0, isect[0]));
            P.set(index + 1, pti);
            wt.set(index + 1, w1);
            index += 2;
            if (i < narcs) {
                P0 = P2;
                T0 = T2;
            }
        }
        var j = 2 * narcs + 1;
        for (var i = 0; i < 3; i++) {
            U.set(i, 0.0);
            U.set(i + j, 1.0);
        }
        if (narcs === 1) {
        }
        else if (narcs === 2) {
            U.set(3, 0.5);
            U.set(4, 0.5);
        }
        else if (narcs === 3) {
            U.set(3, 1 / 3);
            U.set(4, 1 / 3);
            U.set(5, 2 / 3);
            U.set(6, 2 / 3);
        }
        else if (narcs === 4) {
            U.set(3, 0.25);
            U.set(4, 0.25);
            U.set(5, 0.5);
            U.set(6, 0.5);
            U.set(7, 0.75);
            U.set(8, 0.75);
        }
        _this = _super.call(this, p, P, U, wt) || this;
        return _this;
    }
    return CircleArc;
}(BSplineCurve));
exports.CircleArc = CircleArc;
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(coord, radius) {
        return _super.call(this, coord, radius, 0, 2 * Math.PI) || this;
    }
    return Circle;
}(CircleArc));
exports.Circle = Circle;
