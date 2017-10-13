
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

import {
  findSpan, getBasisFunction, getBasisFunctionDerivatives,
  bernstein, blossom, arePointsColinear
} from './helper'
import {
  EPSILON, NDArray, zeros, AABB, add, mul, arr, isequal
} from '@bluemath/common'

/**
 * Rational or polynomial bezier curve
 * If the weights are specified it's a rational Bezier curve
 */
export class BezierCurve {
  degree : number;
  cpoints : NDArray;
  weights? : NDArray;

  constructor(degree:number, cpoints:NDArray, weights?:NDArray) {
    this.degree = degree;
    if(!cpoints.is2D()) {
      throw new Error("cpoints is not an array of points");
    }
    this.cpoints = cpoints;
    if(weights) {
      console.assert(weights.length === degree+1);
    }
    this.weights = weights;
  }

  /**
   * Dimension of the curve. Typically 2D or 3D
   */
  get dimension() {
    return this.cpoints.shape[1];
  }

  /**
   * If the control points are defined in 2D plane, then add z=0 to each
   * of them to define them in 3D space
   */
  to3D() {
    if(this.dimension === 3) { return; }
    console.assert(this.dimension === 2);
    let cpoints = this.cpoints.toArray();
    for(let i=0; i<cpoints.length; i++) {
      cpoints[i].push(0);
    }
    this.cpoints = arr(cpoints);
  }

  /**
   * Is this Rational Bezier Curve
   */
  isRational() : boolean {
    return !!this.weights;
  }

  /**
   * Evaluate the Bezier curve at given parameter value
   * Place the evaluated point in the `tess` array at `tessidx`
   */
  evaluate(u:number, tess?:NDArray, tessidx?:number) {
    let B = bernstein(this.degree, u);
    let dim = this.dimension;

    let denominator;
    if(this.weights) { // isRational
      denominator = 0;
      for(let i=0; i<this.degree+1; i++) {
        denominator += B[i] * <number>this.weights.get(i);
      }
    } else {
      denominator = 1;
    }

    if(tess !== undefined && tessidx !== undefined) {

      for(let k=0; k<this.degree+1; k++) {
        if(this.weights) { // isRational
          for(let z=0; z<dim; z++) {
            tess.set(tessidx,z,
              <number>tess.get(tessidx,z) +
              B[k] * <number>this.cpoints.get(k,z) *
              <number>this.weights.get(k));
          }
        } else {
          for(let z=0; z<dim; z++) {
            tess.set(tessidx,z, 
              <number>tess.get(tessidx,z) +
              B[k] * <number>this.cpoints.get(k,z));
          }
        }
      }
      for(let z=0; z<dim; z++) {
        tess.set(tessidx,z,<number>tess.get(tessidx,z)/denominator);
      }
      return null;
    } else {
      throw new Error('Not implemented');
    }
  }

  /**
   * Tessellate the Bezier curve uniformly at given resolution
   */
  tessellate(resolution=10) : NDArray {
    let tess = new NDArray({
      shape:[resolution+1,this.dimension],
      datatype:'f32'
    });
    for(let i=0; i<resolution+1; i++) {
      this.evaluate(i/resolution, tess, i);
    }
    return tess;
  }
  
  /**
   * The curve is subdivided into two curves at the mipoint of parameter
   * range. This is done recursively until the curve becomes a straight line
   * within given tolerance.
   * The subdivision involves reparameterizing the curve, which is done using
   * blossoming or deCasteljau formula.
   */
  private static tessBezier (bezcrv:BezierCurve, tolerance:number) : number[] {
    if(bezcrv.isLine(tolerance)) {
      return [
        bezcrv.cpoints.getA(0).toArray(),
        bezcrv.cpoints.getA(bezcrv.cpoints.length-1).toArray()
      ];
    } else {
      let left = bezcrv.clone();
      left.reparam(0,0.5);
      let right = bezcrv.clone();
      right.reparam(0.5,1);
      let tessLeft = BezierCurve.tessBezier(left, tolerance);
      let tessRight = BezierCurve.tessBezier(right, tolerance);
      // last point of tessLeft must be same as first point of tessRight
      tessLeft.pop();
      return tessLeft.concat(tessRight);
    }
  }

  /**
   * Tessellate bezier curve adaptively, within given tolerance of error
   */
  tessellateAdaptive(tolerance=EPSILON) : NDArray {
    return new NDArray(BezierCurve.tessBezier(this, tolerance));
  }

  /**
   * Checks if this Bezier curve is approximately a straight line within
   * given tolerance.
   */
  isLine(tolerance=1e-6) {
    if(this.dimension !== 2) {
      throw new Error("isFlat check only supported for 2D Bezier curves");
    }
    if(this.degree === 1) {
      return true;
    }
    return arePointsColinear(this.cpoints, tolerance);
  }

  /**
   * Reparameterize the bezier curve within new parametric interval.
   * It uses the blossoming technique.
   */
  reparam(ua:number, ub:number) {
    let n = this.degree;
    let b = new NDArray({shape:this.cpoints.shape});
    for(let i=0; i<n+1; i++) {
      let ts = [];
      for(let k=0; k<n-i; k++) {
        ts.push(ua);
      }
      for(let k=0; k<i; k++) {
        ts.push(ub);
      }
      b.set(i, blossom(this.cpoints, n, ts));
    }
    this.cpoints = b;
  }

  aabb() : AABB {
    let aabb = new AABB(this.dimension);
    for(let i=0; i<this.cpoints.length; i++) {
      let cpoint = <NDArray>this.cpoints.get(i);
      aabb.update(cpoint);
    }
    return aabb;
  }

  clone() {
    return new BezierCurve(
      this.degree,
      this.cpoints.clone(),
      this.weights ? this.weights.clone() : undefined
    );
  }

  /**
   * Split into two Bezier curves at given parametric value
   */
  split(uk:number) : BezierCurve[] {
    let left = this.clone();
    let right = this.clone();
    left.reparam(0,uk);
    right.reparam(uk,1);
    return [left,right]
  }

  toString() {
    let s = `Bezier(Deg ${this.degree} cpoints ${this.cpoints.toString()}`;
    if(this.weights) {
      s += ` weights ${this.weights.toString()}`;
    }
    s += ')';
    return s;
  }
}

/**
 * Rational BSpline Curve
 */
export class BSplineCurve {

  degree : number;
  cpoints : NDArray;
  knots : NDArray;
  weights? : NDArray;

  constructor(
    degree:number,
    cpoints:NDArray,
    knots:NDArray,
    weights?:NDArray)
  {
    this.degree = degree;
    console.assert(cpoints.is2D());
    this.cpoints = cpoints;
    console.assert(knots.is1D());
    this.knots = knots;
    if(weights) {
      console.assert(knots.is1D());
    }
    this.weights = weights;

    /*
     The degree p, number of control points n+1, number of knots m+1
     are related by
     m = n + p + 1
     [The NURBS book, P3.1]
     */
    let p = degree;
    let m = knots.shape[0]-1;
    let n = cpoints.shape[0]-1;
    console.assert(m === n+p+1);
  }

  /**
   * Determines how many dimension the curve occupies based on shape of
   * Control points array
   */
  get dimension() {
    return this.cpoints.shape[1];
  }

  /**
   * Convert 2D control points to 3D
   */
  to3D() {
    if(this.dimension === 3) { return; }
    console.assert(this.dimension === 2);
    let cpoints = this.cpoints.toArray();
    for(let i=0; i<cpoints.length; i++) {
      cpoints[i].push(0);
    }
    this.cpoints = arr(cpoints);
  }

  /**
   * Split the curve at given parameter value and return two bspline
   * curves. The two curves put together will exactly represent the
   * original curve.
   */
  split(uk:number) {
    let r = this.degree;
    // Count number of times uk already occurs in the knot vector
    // We have to add uk until it occurs p-times in the knot vector,
    // where p is the degree of the curve
    // In case there are knots in the knot vector that are equal to uk,
    // within the error tolerance, then we replace those knots with uk
    // Such knot vector is named safeknots.
    let safeknots = [];

    for(let i=0; i<this.knots.data.length; i++) {
      if(isequal(this.knots.getN(i), uk)) {
        safeknots.push(uk);
        r--;
      } else {
        safeknots.push(this.knots.getN(i));
      }
    }
    let addknots = [];
    for(let i=0; i<r; i++) {
      addknots.push(uk);
    }
    let copy = this.clone();
    copy.setKnots(arr(safeknots));
    copy.refineKnots(addknots);

    // Find the index of the first uk knot in the new knot vector
    let ibreak = -1;
    for(let i=0; i<copy.knots.data.length; i++) {
      if(isequal(copy.knots.getN(i), uk)) {
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

    let lcpoints = copy.cpoints.getA(':'+ibreak);
    let rcpoints = copy.cpoints.getA((ibreak-1)+':');

    let lknots = copy.knots.getA(':'+ibreak).toArray();
    // Scale the internal knot values, to fit into left curve 0-1 param range
    for(let i=copy.degree+1; i<lknots.length; i++) {
      lknots[i] = lknots[i]/uk;
    }
    // Append clamped knots to the left curve at 1
    for(let i=0; i<=copy.degree; i++) {
      lknots.push(1);
    }

    let rknots = copy.knots.getA((ibreak+copy.degree)+':').toArray();
    // Scale the internal knot values, to fit into right curve 0-1 param range
    for(let i=0; i<rknots.length-copy.degree; i++) {
      rknots[i] = (rknots[i]-uk)/(1-uk);
    }
    // Prepend clamped knots to the right curve at 0
    for(let i=0; i<=copy.degree; i++) {
      rknots.unshift(0);
    }

    // TODO : Rational
    let lcurve = new BSplineCurve(copy.degree, lcpoints, arr(lknots)); 
    let rcurve = new BSplineCurve(copy.degree, rcpoints, arr(rknots));

    return [lcurve, rcurve];
    
  }

  /**
   * Replace the knots of this BSplineCurve with new knots
   */
  setKnots(knots:NDArray) {
    if(!this.knots.isShapeEqual(knots)) {
      throw new Error('Invalid knot vector length');
    }
    this.knots = knots;
  }

  /**
   * Set the knot at given index in the knot vector
   */
  setKnot(index:number,knot:number) {
    if(index >= this.knots.shape[0] || index < 0) {
      throw new Error('Invalid knot index');
    }
    if(knot < 0 || knot > 1) {
      throw new Error('Invalid knot value');
    }
    if(index < this.degree+1) {
      if(knot !== 0) {
        throw new Error('Clamped knot has to be zero');
      }
    }
    if(index >= (this.knots.shape[0]-this.degree-1)) {
      if(knot !== 1) {
        throw new Error('Clamped knot has to be one');
      }
    }
    this.knots.set(index, knot);
  }

  /**
   * Set the weight at given index
   */
  setWeight(index:number, weight:number) {
    if(!this.weights) {
      throw new Error('Not a Rational BSpline');
    }
    if(index < 0 || index >= this.weights.shape[0]) {
      throw new Error('Index out of bounds');
    }
    this.weights.set(index, weight);
  }

  /**
   * Is this Rational BSpline Curve. Determined based on whether weights
   * were specified while constructing this BSplineCurve
   */
  isRational() : boolean {
    return !!this.weights;
  }

  /**
   * Evaluate basis function derivatives upto n'th
   */
  private evaluateBasisDerivatives(span:number, n:number, t:number) : NDArray {
    return getBasisFunctionDerivatives(this.degree, t, span, this.knots, n);
  }

  private evaluateBasis(span:number, t:number) : number[] {
    return getBasisFunction(this.degree, this.knots.data, span, t);
  }

  private findSpan(t:number) {
    return findSpan(this.degree, this.knots.data, t);
  }

  private getTermDenominator(span:number, N:number[]) : number {
    let p = this.degree;

    let denominator;
    if(this.weights) {
      denominator = 0.0;
      for(let i=0; i<N.length; i++) {
        denominator += N[i] * <number>this.weights.get(span-p+i);
      }
    } else {
      denominator = 1.0;
    }
    return denominator;
  }

  /**
   * Tesselate basis functions uniformly at given resolution
   */
  tessellateBasis(resolution=10) : NDArray {
    let n = this.cpoints.shape[0]-1;
    let p = this.degree;
    let Nip = zeros([n+1,resolution+1],'f32');
    for(let i=0; i<resolution+1; i++) {
      let u = i/resolution;
      let span = this.findSpan(u);
      let N = this.evaluateBasis(span, u);
      for(let j=p; j>=0; j--) {
        Nip.set(span-j,i,N[p-j]);
      }
    }
    return Nip;
  }

  private static tessBSpline(bcrv:BSplineCurve, tolerance:number) : number[] {
    if(bcrv.isLine(tolerance)) {
      return [
        bcrv.cpoints.getA(0).toArray(),
        bcrv.cpoints.getA(bcrv.cpoints.length-1).toArray()
      ];
    } else {
      let [left,right] = bcrv.split(0.5);
      let tessLeft = BSplineCurve.tessBSpline(left, tolerance);
      let tessRight = BSplineCurve.tessBSpline(right, tolerance);
      // last point of tessLeft must be same as first point of tessRight
      tessLeft.pop();
      return tessLeft.concat(tessRight);
    }
  }

  /**
   * Tessellate this BSplineCurve adaptively within given tolerance of error
   */
  tessellateAdaptive(tolerance=EPSILON) : NDArray {
    return new NDArray(BSplineCurve.tessBSpline(this, tolerance));
  }

  /**
   * Checks if this Bezier curve is approximately a straight line within
   * given tolerance.
   */
  isLine(tolerance=1e-6) {
    if(this.dimension !== 2) {
      throw new Error("isFlat check only supported for 2D Bezier curves");
    }
    if(this.degree === 1) {
      return true;
    }
    return arePointsColinear(this.cpoints, tolerance);
  }

  /**
   * Inserts knot un in the knot vector r-times
   * Algorithm A5.1 from "The NURBS Book"
   */
  insertKnot(un:number, r:number) {
    let p = this.degree;
    let dim = this.dimension;
    let k = this.findSpan(un);
    let isRational = this.isRational();

    // If un already exists in the knot vector then s is it's multiplicity
    let s =0;
    for(let i=0; i<this.knots.shape[0]; i++) {
      if(this.knots.get(i) === un) {
        s++;
      }
    }

    if(r+s >= p) {
      throw new Error('Knot insertion exceeds knot multiplicity beyond degree');
    }

    let m = this.knots.shape[0] - 1;
    let n = m-p-1;

    let P = this.cpoints;
    let Up = this.knots;
    let Q = new NDArray({shape:[P.shape[0]+r,dim]});
    let Uq = new NDArray({shape:[Up.shape[0]+r]});
    let Rtmp, Wtmp;

    Rtmp = new NDArray({shape:[p+1,dim]});

    let Wp, Wq;
    if(this.weights) { // isRational
      Wp = this.weights;
      Wq = new NDArray({shape:[Wp.shape[0] + r]});
      Wtmp = new NDArray({shape:[p+1]});
    }

    // Load new knot vector
    for(let i=0; i<k+1; i++) {
      Uq.set(i, Up.get(i));
    }

    for(let i=1; i<r+1; i++) {
      Uq.set(k+i, un);
    }

    for(let i=k+1; i<m+1; i++) {
      Uq.set(i+r, Up.get(i));
    }

    // Save unaltered control points
    for(let i=0; i<k-p+1; i++) {
      for(let j=0; j<dim; j++) {
        Q.set(i,j, P.get(i,j));
      }
      if(Wp && Wq) { // isRational
        Wq.set(i, Wp.get(i));
      }
    }

    for(let i=k-s; i<n+1; i++) {
      for(let j=0; j<dim; j++) {
        Q.set(i+r,j, P.get(i,j));
      }
      if(Wp && Wq) { // isRational
        Wq.set(i+r,Wp.get(i));
      }
    }

    for(let i=0; i<p-s+1; i++) {
      for(let j=0; j<dim; j++) {
        Rtmp.set(i,j, P.get(k-p+i,j));
      }
    }

    let L=0;
    for(let j=1; j<r+1; j++) {
      L = k-p+j;
      for(let i=0; i<p-j-s+1; i++) {
        let alpha = (un - <number>Up.get(L+i))/(<number>Up.get(i+k+1) - <number>Up.get(L+i));
        for(let z=0; z<dim; z++) {
          Rtmp.set(i,z, alpha * <number>Rtmp.get(i+1,z) + (1-alpha) * <number>Rtmp.get(i,z));
        }
        if(Wtmp) { // isRational
          Wtmp.set(i, alpha * <number>Wtmp.get(i+1) + (1-alpha) * <number>Wtmp.get(i));
        }
      }
      for(let z=0; z<dim; z++) {
        Q.set(L,z, Rtmp.get(0,z));
        Q.set(k+r-j-s,z, Rtmp.get(p-j-s,z));
      }
      if(Wq && Wtmp) { // isRational
        Wq.set(L, Wtmp.get(0));
        Wq.set(k+r-j-s, Wtmp.get(p-j-s));
      }
    }

    for(let i=L+1; i<k-s+1; i++) {
      for(let z=0; z<dim; z++) {
        Q.set(i,z, Rtmp.get(i-L,z));
      }
      if(Wq && Wtmp) { // isRational
        Wq.set(i, Wtmp.get(i-L));
      }
    }

    this.knots = Uq;
    this.cpoints = Q;
    if(isRational) {
      this.weights = Wq;
    }
  }

  /**
   * Inserts multiple knots into the knot vector at once
   * Algorithm A5.4 from "The NURBS Book"
   * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
   */
  refineKnots(ukList:number[]) {
    let m = this.knots.length-1;
    let p = this.degree;
    let n = m-p-1;
    let dim = this.dimension;
    let X = ukList;
    let r = ukList.length-1;
    let P = this.cpoints;
    let Q = new NDArray({shape:[P.length+r+1, dim]});
    let U = this.knots;
    let Ubar = new NDArray({shape:[U.length+r+1]});

    let Wp,Wq;
    if(this.weights) { // isRational
      Wq = new NDArray({shape:[P.length+r+1]});
      Wp = this.weights;
    }

    let a = this.findSpan(X[0]);
    let b = this.findSpan(X[r]);
    b += 1;

    // Copy control points and weights for u < a and u > b
    for(let j=0; j<a-p+1; j++) {
      for(let k=0; k<dim; k++) {
        Q.set(j,k, P.get(j,k));
      }
      if(Wp && Wq) { // isRational
        Wq.set(j, Wp.get(j));
      }
    }
    for(let j=b-1; j<n+1; j++) {
      for(let k=0; k<dim; k++) {
        Q.set(j+r+1,k, P.get(j,k));
      }
      if(Wp && Wq) { // isRational
        Wq.set(j+r+1, Wp.get(j));
      }
    }

    // Copy knots for u < a and u > b
    for(let j=0; j<a+1; j++) {
      Ubar.set(j, U.get(j));
    }
    for(let j=b+p; j<m+1; j++) {
      Ubar.set(j+r+1, U.get(j));
    }

    // For values of u between a and b
    let i = b+p-1;
    let k = b+p+r;

    for(let j=r; j>=0; j--) {
      while(X[j] <= U.get(i) && i>a) {
        for(let z=0; z<dim; z++) {
          Q.set(k-p-1,z, P.get(i-p-1,z));
        }
        if(Wp && Wq) { // isRational
          Wq.set(k-p-1, Wp.get(i-p-1));
        }
        Ubar.set(k,U.get(i));
        k -= 1;
        i -= 1;
      }
      for(let z=0; z<dim; z++) {
        Q.set(k-p-1,z, Q.get(k-p,z));
      }
      if(Wp && Wq) { // isRational
        Wq.set(k-p-1, Wq.get(k-p));
      }

      for(let l=1; l<p+1; l++) {
        let ind = k-p+l;
        let alpha = <number>Ubar.get(k+l)-X[j];
        if(Math.abs(alpha) === 0.0) {
          for(let z=0; z<dim; z++) {
            Q.set(ind-1,z, Q.get(ind,z));
          }
          if(Wp && Wq) { // isRational
            Wq.set(ind-1, Wq.get(ind));
          }
        } else {
          alpha = alpha/(<number>Ubar.get(k+l)-<number>U.get(i-p+l));
          for(let z=0; z<dim; z++) {
            Q.set(ind-1,z,
              alpha * <number>Q.get(ind-1,z) +
              (1.0-alpha) * <number>Q.get(ind,z));
          }
          if(Wq) { // isRational
            Wq.set(ind-1,
              alpha*<number>Wq.get(ind-1) +
              (1.0-alpha)*<number>Wq.get(ind));
          }
        }
      }
      Ubar.set(k, X[j]);
      k -= 1;
    }
    this.knots = Ubar;
    this.cpoints = Q;
    if(this.weights) { // isRational
      this.weights = Wq;
    }
  }

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
  decompose() {
    let p = this.degree;
    let U = this.knots;
    let m = U.length-1;
    let P = this.cpoints;
    let dim = this.dimension;
    let alphas = new NDArray({shape:[p]});

    let a = p;
    let b = p+1;

    let total_bezier = m-2*p;

    let Q = new NDArray({shape:[total_bezier,p+1,dim]});
    let nb = 0; // Counter for Bezier segments
    for(let i=0; i<p+1; i++) {
      for(let z=0; z<dim; z++) {
        Q.set(nb,i,z, P.get(i,z))
      }
    }

    let i;

    while(b<m) {
      i = b;
      while(b<m && U.get(b+1) === U.get(b)) {
        b += 1;
      }
      let mult = b-i+1;
      if(mult < p) {
        let numerator = <number>U.get(b) - <number>U.get(a);

        // Compute and store alphas
        for(let j=p; j>mult; j--) {
          alphas.set(j-mult-1, numerator/(<number>U.get(a+j)-<number>U.get(a)));
        }
        let r = p-mult; // Insert knot r times
        for(let j=1; j<r+1; j++) {
          let save = r-j;
          let s = mult+j; // This many new points
          for(let k=p; k>s-1; k--) {
            let alpha = <number>alphas.get(k-s);
            for(let z=0; z<dim; z++) {
              Q.set(nb,k,z,
                alpha*<number>Q.get(nb,k,z) +
                (1.0-alpha)*<number>Q.get(nb,k-1,z));
            }
          }
          if(b<m) {
            for(let z=0; z<dim; z++) {
              Q.set(nb+1,save,z, Q.get(nb,p,z));
            }
          }
        }
      }
      nb += 1;
      if(b<m) { // Initilize for next segment
        for(let i=p-mult; i<p+1; i++) {
          for(let z=0; z<dim; z++) {
            Q.set(nb,i,z, P.get(b-p+i,z))
          }
        }
        a = b;
        b += 1;
      }
    }

    let bezlist = [];
    for(let i=0; i<Q.length; i++) {
      bezlist.push(new BezierCurve(p, (<NDArray>Q.get(i)).reshape([p+1,dim])));
    }
    return bezlist;
  }

  /**
   * Evaluate the BSplineCurve at given parameter value
   * If `tess` parameter is provided then the evaluated value is
   * placed in the `tess` array at index `tessidx`. Otherwise the single
   * euclidean point is returned.
   */
  evaluate(t:number, tess?:NDArray, tessidx?:number) : NDArray|null {
    let p = this.degree;
    let span = this.findSpan(t);
    let dim = this.dimension;
    let N = this.evaluateBasis(span, t);
    let denominator = this.getTermDenominator(span, N);
    if(tess) {
      tessidx = tessidx || 0;
      for(let i=0; i<p+1; i++) {
        let K;
        if(this.weights) {
          K = N[i] * <number>this.weights.get(span-p+i)/denominator;
        } else {
          K = N[i]/denominator;
        }
        for(let z=0; z<dim; z++) {
          let c = <number>this.cpoints.get(span-p+i, z);
          tess.set(tessidx, z, (<number>tess.get(tessidx,z)) + K*c);
        }
      }
      return null;
    } else {
      let point = new NDArray({shape:[dim]});
      for(let i=0; i<p+1; i++) {
        let K;
        if(this.weights) {
          K = N[i] * <number>this.weights.get(span-p+i)/denominator;
        } else {
          K = N[i]/denominator;
        }
        for(let z=0; z<dim; z++) {
          let c = <number>this.cpoints.get(span-p+i, z);
          point.set(z, <number>point.get(z) + K*c);
        }
      }
      return point;
    }
  }

  /**
   * Evaluate the derivative of BSplineCurve at given parameter value
   * If `tess` parameter is provided then the evaluated value is
   * placed in the `tess` array at index `tessidx`. Otherwise the single
   * euclidean point is returned.
   */
  evaluateDerivative(
    t:number, d:number, tess?:NDArray, tessidx?:number) : NDArray|null
  {
    let p = this.degree;
    let P = this.cpoints;
    let du = Math.min(d,p);
    let ders = zeros([du+1,2]);
    let span = this.findSpan(t);
    let Nders = this.evaluateBasisDerivatives(span, du, t);
    for(let k=0; k<du+1; k++) {
      ders.set(k,zeros(2));
      for(let j=0; j<p+1; j++) {
        ders.set(k, add(
          ders.getA(k),
          mul(Nders.getN(k,j), P.getA(span-p+j))
        ));
      }
    }
    if(tess && tessidx !== undefined) {
      for(let i=0; i<du+1; i++) {
        tess.set(tessidx,i, ders.getA(i));
      }
      return null;
    } else {
      throw new Error('Not implemented');
    }
  }

  /**
   * Tessellate the BSplineCurve uniformly at given resolution
   */
  tessellate(resolution=10) : NDArray {
    let tess = new NDArray({
      shape:[resolution+1,this.dimension],
      datatype:'f32'
    });
    for(let i=0; i<resolution+1; i++) {
      this.evaluate(i/resolution, tess, i);
    }
    return tess;
  }

  /**
   * Tessellate derivatives of BSplineCurve uniformly at given resolution
   */
  tessellateDerivatives(resolution=10, d:number) : NDArray {
    let tess = new NDArray({
      shape:[resolution+1,d,this.dimension],
      datatype:'f32'
    });
    for(let i=0; i<resolution+1; i++) {
      this.evaluateDerivative(i/resolution, d, tess, i);
    }
    return tess;
  }

  clone() : BSplineCurve {
    return new BSplineCurve(
      this.degree,
      this.cpoints.clone(),
      this.knots.clone(),
      this.weights ? this.weights.clone() : undefined);
  }

  aabb() : AABB {
    let aabb = new AABB(this.dimension);
    for(let i=0; i<this.cpoints.length; i++) {
      let cpoint = <NDArray>this.cpoints.get(i);
      aabb.update(cpoint);
    }
    return aabb;
  }

  toString() {
    let s = `BSpline(Deg ${this.degree} cpoints ${this.cpoints.toString()})`;
    s += ` knots ${this.knots.toString()}`;
    if(this.weights) { // isRational
      s += ` weights ${this.weights.toString()}`;
    }
    return s;
  }
}
