/*

Copyright (C) 2017 Jayesh Salvi, Blue Math Software Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import {                                                                                                                                                      
  findSpan, getBasisFunction,
  bernstein, planeFrom3Points
} from './helper'
import {
  NDArray,zeros,arr,add,dot,mul,dir,count,empty,iszero,AABB,isequal,
  EPSILON, TypedArray
} from '@bluemath/common'

class BezierSurface {

  u_degree : number;
  v_degree : number;
  cpoints : NDArray;
  weights? : NDArray;

  constructor(
    u_degree:number,
    v_degree:number,
    cpoints:NDArray|number[][][],
    weights?:NDArray|number[][])
  {
    this.u_degree = u_degree;
    this.v_degree = v_degree;
    this.cpoints = cpoints instanceof NDArray ? cpoints : new NDArray(cpoints);
    console.assert(this.cpoints.shape.length === 3);
    console.assert(this.cpoints.shape[2] === 2 || this.cpoints.shape[2] === 3);
    if(weights) {
      this.weights = weights instanceof NDArray ? weights : new NDArray(weights);
      console.assert(this.weights.shape.length === 2);
    }
  }

  get dimension() {
    return this.cpoints.shape[2];
  }

  isRational() {
    return !!this.weights;
  }

  evaluate(u:number, v:number, tess:NDArray, uidx:number, vidx:number) {
    let Bu = bernstein(this.u_degree, u);
    let Bv = bernstein(this.v_degree, v);
    let denominator = 1;
    if(this.weights) { // isRational
      denominator = 0;
      for(let i=0; i<this.u_degree+1; i++) {
        for(let j=0; j<this.v_degree+1; j++) {
          denominator += Bu[i] * Bv[j] * <number>this.weights.get(i,j);
        }
      } 
    }

    for(let i=0; i<this.u_degree+1; i++) {
      for(let j=0; j<this.v_degree+1; j++) {
        if(this.weights) { // isRational
          tess.set(uidx, vidx,
            add(tess.get(uidx,vidx),
                mul(Bu[i], Bv[j],
                    this.weights.get(i,j),
                    this.cpoints.get(i,j))))
        } else {
          tess.set(uidx, vidx,
            add(tess.get(uidx,vidx),
                mul(Bu[i], Bv[j],
                    this.cpoints.get(i,j))))
        }
      }
    }
  }

  tessellatePoints(resolution=10) {
    let tess = new NDArray({
      shape : [resolution+1, resolution+1, this.dimension],
      datatype : 'f32'
    });
    for(let i=0; i<resolution+1; i++) {
      for(let j=0; j<resolution+1; j++) {
        let u = i/resolution;
        let v = j/resolution;
        this.evaluate(u,v,tess,i,j);
      }
    }
    return tess;
  }

  tessellate(resolution=10) {
    /*
           i  ---> m

           0             1             2             3

     j  0  +------------------------------------------
           |0          / |1          / |2          / |3
           |         /   |         /   |         /   |
     |     |       /     |       /     |       /     |
     |     |     /       |     /       |     /       |
     v     |   /         |   /         |   /         |
           | /           | /           | /           |
     n  1  +-----------------------------------------+
           |4          / |5          / |6          / |7
           |         /   |         /   |         /   |
           |       /     |       /     |       /     |
           |     /       |     /       |     /       |
           |   /         |   /         |   /         |
           | /           | /           | /           |
        2  +------------------------------------------
            8             9             10            11

                             mj+i           mj+i+1
                                 +---------+
                                 |        /|
                                 | --->  / |
                                 | |    /  |
                                 | |   /   |
                                 |    /    |
                                 |   /   | |
                                 |  /    | |
                                 | /  <--- |
                                 |/        |
                                 ----------+
                        m(j+1)+i            m(j+1)+i+1

    */
    let tessPoints = this.tessellatePoints(resolution);
    let N = resolution+1;
    let faces:number[] = [];
    for(let i=0; i<N-1; i++) {
      for(let j=0; j<N-1; j++) {
        faces = faces.concat(
          0, N*j+i, N*j+i+1, N*(j+1)+i,
          0, N*j+i+1, N*(j+1)+i+1, N*(j+1)+i
        );
      }
    }
    tessPoints.reshape([N*N]);
    return {vertices:tessPoints.data,faces};
  }

  aabb() : AABB {
    let aabb = new AABB(this.dimension);
    for(let i=0; i<this.cpoints.length; i++) {
      let cpoint = <NDArray>this.cpoints.get(i);
      aabb.update(cpoint);
    }
    return aabb;
  }

  clone() : BezierSurface {
    return new BezierSurface(
      this.u_degree, this.v_degree,
      this.cpoints, this.weights);
  }
}

class BSplineSurface {

  u_degree : number;
  v_degree : number;
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
  cpoints : NDArray;
  u_knots : NDArray;
  v_knots : NDArray;
  weights? : NDArray;

  constructor(
    u_degree:number,
    v_degree:number,
    u_knots:NDArray|number[],
    v_knots:NDArray|number[],
    cpoints:NDArray|number[][][],
    weights?:NDArray|number[][])
  {
    this.u_degree = u_degree;
    this.v_degree = v_degree;
    this.u_knots = u_knots instanceof NDArray ? u_knots : new NDArray(u_knots);
    this.v_knots = v_knots instanceof NDArray ? v_knots : new NDArray(v_knots);
    this.cpoints = cpoints instanceof NDArray ? cpoints : new NDArray(cpoints);
    if(weights) {
      this.weights = weights instanceof NDArray ? weights : new NDArray(weights);
    }
  }

  get dimension() {
    return this.cpoints.shape[2];
  }

  clone() {
    return new BSplineSurface(
      this.u_degree,
      this.v_degree,
      this.u_knots.clone(),
      this.v_knots.clone(),
      this.cpoints.clone(),
      this.weights ? this.weights.clone() : undefined
    );
  }

  aabb() : AABB {
    let aabb = new AABB(this.dimension);
    for(let i=0; i<this.cpoints.length; i++) {
      let cpoint = <NDArray>this.cpoints.get(i);
      aabb.update(cpoint);
    }
    return aabb;
  }

  isRational() {
    return !!this.weights;
  }

  isFlat(tolerance=EPSILON) {
    let nU = this.cpoints.shape[0];
    let nV = this.cpoints.shape[1];
    let p00 = this.cpoints.getA(0,0);
    let p01 = this.cpoints.getA(0,nU-1);
    let p11 = this.cpoints.getA(nV-1,nU-1);
    let p10 = this.cpoints.getA(nV-1,0);

    let [a0,b0,c0,d0] = planeFrom3Points(p00,p01,p11);
    let [a1,b1,c1,d1] = planeFrom3Points(p00,p11,p10);

    // Mean plane is average of normals and offset of two planes
    let n0 = arr([a0,b0,c0]);
    let n1 = arr([a1,b1,c1]);
    let n = dir(<NDArray>add(n0,n1));
    let d = (d0+d1)/2;

    // We substitute every control point in this equation of mean plane
    // If the resulting value is within tolerance, then they are on
    // the plane for given tolerance. If all of them are on the plane
    // then the BSpline Surface could be considered flat for given tolerance
    for(let i=0; i<nU; i++) {
      for(let j=0; j<nV; j++) {
        let cpoint = this.cpoints.getA(i,j);
        let val = <number>add(dot(n,cpoint), d);
        if(Math.abs(val) > tolerance) {
          return false;
        }
      }
    }
    return true;
  }

  setUKnots(u_knots:NDArray) {
    if(!this.u_knots.isShapeEqual(u_knots)) {
      throw new Error('Invalid U knot vector length');
    }
    this.u_knots = u_knots;
  }

  setVKnots(v_knots:NDArray) {
    if(!this.v_knots.isShapeEqual(v_knots)) {
      throw new Error('Invalid V knot vector length');
    }
    this.v_knots = v_knots;
  }

  evaluate(u:number, v:number, tess:NDArray, uidx:number, vidx:number) {
    let u_span = findSpan(this.u_degree, this.u_knots.data, u);
    let v_span = findSpan(this.v_degree, this.v_knots.data, v);
    let Nu = getBasisFunction(this.u_degree, this.u_knots.data, u_span, u);
    let Nv = getBasisFunction(this.v_degree, this.v_knots.data, v_span, v);
    let dim = this.dimension;

    let u_ind = u_span - this.u_degree;
    let temp;
    for(let l=0; l<this.v_degree+1; l++) {
      temp = zeros([dim]); 
      let v_ind = v_span - this.v_degree + l;
      for(let k=0; k<this.u_degree+1; k++) {
        if(this.weights) {
          temp = add(temp, mul(Nu[k],
            this.cpoints.get(u_ind+k,v_ind),this.weights.get(u_ind+k,v_ind)));
        } else {
          temp = add(temp, mul(Nu[k],this.cpoints.get(u_ind+k,v_ind)));
        }
      }
      tess.set(uidx,vidx,
        add(tess.get(uidx,vidx), mul(Nv[l], temp)));
    }
  }

  tessellatePoints(resolution=10) {
    let tess = new NDArray({
      shape : [resolution+1, resolution+1, this.dimension],
      datatype : 'f32'
    });
    for(let i=0; i<resolution+1; i++) {
      for(let j=0; j<resolution+1; j++) {
        let u = i/resolution;
        let v = j/resolution;
        this.evaluate(u,v,tess,i,j);
      }
    }
    return tess;
  }

  tessellate(resolution=10) {
    let tessPoints = this.tessellatePoints(resolution);
    let N = resolution+1;
    let faces:number[] = [];
    for(let i=0; i<N-1; i++) {
      for(let j=0; j<N-1; j++) {
        faces = faces.concat(
          0, N*j+i, N*j+i+1, N*(j+1)+i,
          0, N*j+i+1, N*(j+1)+i+1, N*(j+1)+i
        );
      }
    }
    tessPoints.reshape([N*N]);
    return {vertices:tessPoints.data,faces};
  }

  static tessellateRecursive(bsrf:BSplineSurface, tolerance=EPSILON) {
    let tessArr:{vertices:TypedArray,faces:number[]}[] = [];

    if(bsrf.isFlat(tolerance)) {
      tessArr.push(bsrf.tessellate(10));
    } else {
      for(let surf of bsrf.splitUV(0.5,0.5)) {
        tessArr = tessArr.concat(
          BSplineSurface.tessellateRecursive(surf,tolerance));
      }
    }
    return tessArr;
  }

  tessellateAdaptive(tolerance=EPSILON) {
    return BSplineSurface.tessellateRecursive(this,tolerance);
  }

  /**
   * Split this BSplineSurface into two at uk, by refining u-knots
   */
  splitU(uk:number) {
    let r = this.u_degree;
    // Count number of times uk already occurs in the u-knot vector
    // We have to add uk until it occurs r-times in the u-knot vector,
    // where r is the u-degree of the curve
    // In case there are knots in the u-knot vector that are equal to uk
    // within the error tolerance, then we replace them with uk
    // Such u-knot vector is named safe_uknots.
    let safe_uknots = [];

    for(let i=0; i<this.u_knots.data.length; i++) {
      if(isequal(this.u_knots.getN(i), uk)) {
        safe_uknots.push(uk);
        r--;
      } else {
        safe_uknots.push(this.u_knots.getN(i));
      }
    }

    let add_uknots = [];
    for(let i=0; i<r; i++) {
      add_uknots.push(uk);
    }

    let copy = this.clone();
    copy.setUKnots(arr(safe_uknots));
    copy.refineKnotsU(add_uknots);

    // Find the index of the first uk knot in the new knot vector
    let ibreak = -1;
    for(let i=0; i<copy.u_knots.data.length; i++) {
      if(isequal(copy.u_knots.getN(i), uk)) {
        ibreak = i;
        break;
      }
    }
    console.assert(ibreak >= 0);

    // The U-control points of the surface where the split will happen are
    // at the index *ibreak-1* in the U-direction of control points array
    // The left surface will have *ibreak* u-control point rows
    // The right surface will have *N-ibreak+1* u-control point rows
    // (where N is the number of control points rows in U direction
    // in the original surface)
    // The control point at *ibreak-1* will be repeated in left and right
    // surfaces. It will be the last u-control point of the left surface
    // and first u-control point of the right surface

    let lcpoints = copy.cpoints.getA(':'+ibreak,':');
    let rcpoints = copy.cpoints.getA((ibreak-1)+':',':');

    let l_uknots = copy.u_knots.getA(':'+ibreak).toArray();
    // Scale the internal u knots values, to fit into the left surface's
    // 0-1 u parameter range
    for(let i=copy.u_degree+1; i<l_uknots.length; i++) {
      l_uknots[i] = l_uknots[i]/uk;
    }

    // Append clamped knots to the left curve at 1
    for(let i=0; i<=copy.u_degree; i++) {
      l_uknots.push(1);
    }

    let r_uknots = copy.u_knots.getA((ibreak+copy.u_degree)+':').toArray()
    // Scale the internal knot values, to fit into the right surface's
    // 0-1 u parameter range
    for(let i=0; i<r_uknots.length-copy.u_degree; i++) {
      r_uknots[i] = (r_uknots[i]-uk)/(1-uk);
    }
    // Prepend clamped knots to the right curve at 0
    for(let i=0; i<=copy.u_degree; i++) {
      r_uknots.unshift(0);
    }

    // TODO : Rational
    let lsurf = new BSplineSurface(
      copy.u_degree, copy.v_degree, l_uknots, copy.v_knots, lcpoints);
    let rsurf = new BSplineSurface(
      copy.u_degree, copy.v_degree, r_uknots, copy.v_knots, rcpoints);

    return [lsurf,rsurf];
  }

  /**
   * Split this BSplineSurface into two at vk, by refining v-knots
   */
  splitV(vk:number) {
    let r = this.v_degree;
    // Count number of times vk already occurs in the v-knot vector
    // We have to add vk until it occurs r-times in the v-knot vector,
    // where r is the v-degree of the curve
    // In case there are knots in the v-knot vector that are equal to vk
    // within the error tolerance, then we replace them with vk
    // Such v-knot vector is named safe_vknots
    let safe_vknots = [];

    for(let i=0; i<this.v_knots.data.length; i++) {
      if(isequal(this.v_knots.getN(i), vk)) {
        safe_vknots.push(vk);
        r--;
      } else {
        safe_vknots.push(this.v_knots.getN(i));
      }
    }

    let add_vknots = [];
    for(let i=0; i<r; i++) {
      add_vknots.push(vk);
    }

    let copy = this.clone();
    copy.setVKnots(arr(safe_vknots));
    copy.refineKnotsV(add_vknots);

    // Find the index of the first vk knot in the new knot vector
    let ibreak = -1;
    for(let i=0; i<copy.v_knots.data.length; i++) {
      if(isequal(copy.v_knots.getN(i), vk)) {
        ibreak = i;
        break;
      }
    }
    console.assert(ibreak >= 0);

    // The V-control points of the surface where the split will happen are
    // at the index *ibreak-1* in the V-direction of control points array
    // The left surface will have *ibreak* v-control point columns
    // The right surface will have *N-ibreak+1* v-control point columns 
    // (where N is the number of control points rows in V direction
    // in the original surface)
    // The control point at *ibreak-1* will be repeated in left and right
    // surfaces. It will be the last v-control point of the left surface
    // and first v-control point of the right surface

    let lcpoints = copy.cpoints.getA(':',':'+ibreak);
    let rcpoints = copy.cpoints.getA(':',(ibreak-1)+':');

    let l_vknots = copy.v_knots.getA(':'+ibreak).toArray();
    // Scale the internal v knot values to fit into the left surface's 0-1
    // v parameter range
    for(let i=copy.v_degree+1; i<l_vknots.length; i++) {
      l_vknots[i] = l_vknots[i]/vk;
    }

    // Append clamped knots to the left curve at 1
    for(let i=0; i<=copy.v_degree; i++) {
      l_vknots.push(1);
    }

    let r_vknots = copy.v_knots.getA((ibreak+copy.v_degree)+':').toArray();
    // Scale the internal knot values to fit into the right surface's
    // 0-1 v parameter range
    for(let i=0; i<r_vknots.length-copy.v_degree; i++) {
      r_vknots[i] = (r_vknots[i]-vk)/(1-vk);
    }
    // Prepend clamped knots to the right curve at 0
    for(let i=0; i<=copy.v_degree; i++) {
      r_vknots.unshift(0);
    }

    // TODO : Rational
    let lsurf = new BSplineSurface(
      copy.u_degree, copy.v_degree, copy.u_knots, l_vknots, lcpoints);
    let rsurf = new BSplineSurface(
      copy.u_degree, copy.v_degree, copy.u_knots, r_vknots, rcpoints);

    return [lsurf,rsurf];
  }

  /**
   * Split this BSplineSurface into four
   */
  splitUV(uk:number,vk:number) {
    let [ul_surf, ur_surf] = this.splitU(uk);
    return [
      ...ul_surf.splitV(vk),
      ...ur_surf.splitV(vk)
    ];
  }

  /**
   * Inserts knot un in the U knot vector r-times
   * Ref: Algorithm A5.3 "The NURBS book"
   * @param un Knot to be inserted
   * @param r Number of times to insert the knot
   */
  insertKnotU(un:number, r:number) {
    let p = this.u_degree;

    // Knot will be inserted between [k, k+1)
    let k = findSpan(p, this.u_knots.data, un);

    // If un already exists in the knot vector, s is its multiplicity
    let s = count(this.u_knots, un, 0);

    if(r+s > p) {
      throw new Error('Knot insertion exceeds knot multiplicity beyond degree');
    }

    let mU = this.u_knots.length-1;
    let nU = mU-this.u_degree-1;
    let mV = this.v_knots.length-1;
    let nV = mV-this.v_degree-1;

    let P = this.cpoints;
    let Q = empty([nU+1+r,nV+1,this.dimension]);
    let UP = this.u_knots;
    let UQ = empty([UP.length+r]);
    let VP = this.v_knots;
    let VQ = empty([VP.length]);

    // Load u-vector
    for(let i=0; i<k+1; i++) {
      UQ.set(i, UP.get(i));
    }
    for(let i=1; i<r+1; i++) {
      UQ.set(k+i, un);
    }
    for(let i=k+1; i<mU+1; i++) {
      UQ.set(i+r, UP.get(i));
    }

    // Copy v-vector
    VQ.copyfrom(VP);

    let alpha = empty([p+1,r+1]);
    let R = empty([p+1,this.dimension]);

    let L=0;

    // Pre-calculate alphas
    for(let j=1; j<r+1; j++) {
      L = k-p+j;
      for(let i=0; i<p-j-s+1; i++) {
        alpha.set(i,j,
          (un-<number>UP.get(L+i))/(<number>UP.get(i+k+1)-<number>UP.get(L+i)));
      }
    }

    for(let row=0; row<nV+1; row++) {
      // Save unaltered control points
      for(let i=0; i<k-p+1; i++) {
        Q.set(i, row, P.get(i, row));
      }
      for(let i=k-s; i<nU+1; i++) {
        Q.set(i+r, row, P.get(i, row));
      }

      // Load auxiliary control points
      for(let i=0; i<p-s+1; i++) {
        R.set(i, P.get(k-p+i, row));
      }
      for(let j=1; j<r+1; j++) {
        L = k-p+j;
        for(let i=0; i<p-j-s+1; i++) {
          R.set(i,
            add(
              mul(alpha.get(i,j),R.get(i+1)),
              mul(1.0-<number>alpha.get(i,j),R.get(i))
            )
          );
        }
        Q.set(L,row, R.get(0));
        Q.set(k+r-j-s,row, R.get(p-j-s));
      }

      // Load the remaining control points
      for(let i=L+1; i<k-s; i++) { // TODO // Assuming L value is still good
        Q.set(i,row, R.get(i-L));
      }
    }
    this.cpoints = Q
    this.v_knots = VQ
  }

  /**
   * Inserts knot vn in the V knot vector r-times
   * Ref: Algorithm A5.3 "The NURBS book"
   * @param vn Knot to be inserted
   * @param r Number of times to insert the knot
   */
  insertKnotV(vn:number, r:number) {
    let q = this.v_degree;

    // Knot will be inserted between [k,k+1)
    let k = findSpan(this.v_degree, this.v_knots.data, vn);

    // If v already exists in knot vector, s is its multiplicity
    let s = count(this.v_knots, vn, 0);

    if(r+s > q) {
      throw new Error('Knot insertion exceeds knot multiplicity beyond degree');
    }

    let mU = this.u_knots.length - 1;
    let nU = mU - this.u_degree - 1;
    let mV = this.v_knots.length - 1;
    let nV = mV - this.v_degree - 1;

    let P = this.cpoints;
    let Q = empty([nU+1, nV+r+1, this.dimension]);
    let UP = this.u_knots;
    let UQ = empty([UP.length]);
    let VP = this.v_knots;
    let VQ = empty([VP.length+r]);

    // Copy u knot vector
    UQ.copyfrom(UP);

    // Load v knot vector
    for(let i=0; i<k+1; i++) {
      VQ.set(i, VP.get(i));
    }
    for(let i=1; i<r+1; i++) {
      VQ.set(k+i, vn);
    }
    for(let i=k+1; i<mV+1; i++) {
      VQ.set(i+r, VP.get(i));
    }

    let alpha = empty([q+1,r+1]);
    let R = empty([q+1, this.dimension]);

    let L = 0;

    // Pre-calculate alphas
    for(let j=1; j<r+1; j++) {
      L = k-q+j;
      for(let i=0; i<q-j-s+1; i++) {
        alpha.set(i,j,
          (vn-<number>VP.get(L+i))/(<number>VP.get(i+k+1)-<number>VP.get(L+i))
        );
      }
    }

    for(let col=0; col<nU+1; col++) {

      // Save unaltered control points
      for(let i=0; i<k-q+1; i++) {
        Q.set(col, i, P.get(col,i));
      }
      for(let i=k-s; i<nV+1; i++) {
        Q.set(col, i+r, P.get(col,i));
      }

      // Load auxiliary control points
      for(let i=0; i<q-s+1; i++) {
        R.set(i, P.get(col, k-q+i));
      }
      for(let j=1; j<r+1; j++) {
        L = k-q+j;
        for(let i=0; i<q-j-s+1; i++) {
          R.set(i, add(
            mul(alpha.get(i,j), R.get(i+1)),
            mul((1.0-<number>alpha.get(i,j)), R.get(i))
          ));
        }
        Q.set(col,L, R.get(0));
        Q.set(col,k+r-j-s, R.get(q-j-s));
      }

      // Load remaining control points
      for(let i=L+1; i<k-s; i++) {
        Q.set(col, i, R.get(i-L));
      }
    }
    this.cpoints = Q;
    this.v_knots = VQ;
  }

  /**
   * Insert knots in U and V knot vectors 
   * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
   */
  insertKnotUV(un:number, vn:number, ur:number,vr:number) {
    this.insertKnotU(un, ur);
    this.insertKnotV(vn, vr);
  }

  /**
   * Inserts multiple knots into the U knot vector at once
   * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
   */
  refineKnotsU(uklist:number[]) {
    let mU = this.u_knots.length-1;
    let mV = this.v_knots.length-1;
    let p = this.u_degree;
    let q = this.v_degree;
    let nU = mU-p-1;
    let nV = mV-q-1;
    let X = uklist;
    let r = uklist.length-1;
    let U = this.u_knots;
    let V = this.v_knots;
    let Ubar = empty(U.length+r+1);
    let Vbar = empty(V.length);
    let P = this.cpoints;
    let Q = empty([nU+1+r+1, nV+1, this.dimension]);

    let a = findSpan(p, U.data, X[0]);
    let b = findSpan(p, U.data, X[r]);

    b += 1;

    // Initialize Ubar (for u<a and u>b)
    for(let j=0; j<a+1; j++) {
      Ubar.set(j, U.get(j));
    }
    for(let j=b+p; j<mU+1; j++) {
      Ubar.set(j+r+1, U.get(j));
    }

    // Copy V into Vbar as is
    Vbar.copyfrom(V);

    // Copy unaltered control points (corresponding to u<a and u>b)
    for(let row=0; row<nV+1; row++) {
      for(let k=0; k<a-p+1; k++) {
        Q.set(k,row, P.get(k,row));
      }
      for(let k=b-1; k<nU+1; k++) {
        Q.set(k+r+1,row, P.get(k,row));
      }
    }

    let i = b+p-1;
    let k = b+p+r;

    for(let j=r; j>=0; j--) {
      while(X[j] <= U.get(i) && i > a) {
        Ubar.set(k, U.get(i));
        for(let row=0; row<nV+1; row++) {
          Q.set(k-p-1,row,P.get(i-p-1,row));
        }
        k -= 1;
        i -= 1;
      }

      for(let row=0; row<nV+1; row++) {
        Q.set(k-p-1,row,Q.get(k-p,row));
      }

      for(let l=1; l<p+1; l++) {
        let ind = k-p+l;
        let alpha = <number>Ubar.get(k+l)-X[j];
        if(iszero(alpha)) {
          for(let row=0; row<nV+1; row++) {
            Q.set(ind-1,row, Q.get(ind,row));
          }
        } else {
          alpha = alpha/(<number>Ubar.get(k+l)-<number>U.get(i-p+l));
          for(let row=0; row<nV+1; row++) {
            Q.set(ind-1,row,
              add(
                mul(alpha, Q.get(ind-1,row)),
                mul((1.0-alpha), Q.get(ind,row))
              )
            );
          }
        }
      }
      Ubar.set(k, X[j]);
      k -= 1;
    }
    this.u_knots = Ubar;
    this.cpoints = Q;
  }

  /**
   * Inserts multiple knots into the V knot vector at once
   * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
   */
  refineKnotsV(vklist:number[]) {
    let mU = this.u_knots.length-1;
    let mV = this.v_knots.length-1;
    let p = this.u_degree;
    let q = this.v_degree;
    let nU = mU-p-1;
    let nV = mV-q-1;
    let X = vklist;
    let r = vklist.length-1;
    let U = this.u_knots;
    let V = this.v_knots;
    let Ubar = empty(U.length);
    let Vbar = empty(V.length+r+1);
    let P = this.cpoints;
    let Q = empty([nU+1, nU+1+r+1, this.dimension]);

    let a = findSpan(q, V.data, X[0]);
    let b = findSpan(q, V.data, X[r]);
    b += 1;

    // Initialize Vbar (for u<a and u>b)
    for(let j=0; j<a+1; j++) {
      Vbar.set(j, V.get(j));
    }
    for(let j=b+q; j<mV+1; j++) {
      Vbar.set(j+r+1, V.get(j));
    }

    // Copy U into Ubar as-is
    Ubar.copyfrom(U);

    // Copy unaltered control points (corresponding to u<a and u>b)
    for(let col=0; col<nU+1; col++) {
      for(let k=0; k<a-q+1; k++) {
        Q.set(col,k, P.get(col,k));
      }
      for(let k=b-1; k<nV+1; k++) {
        Q.set(col,k+r+1, P.get(col,k));
      }
    }

    let i = b+q-1;
    let k = b+q+r;

    for(let j=r; j>=0; j--) {
      while(X[j] <= V.get(i) && i>a) {
        Vbar.set(k, V.get(i));
        for(let col=0; col<nU+1; col++) {
          Q.set(col, k-q-1, P.get(col, i-q-1));
        }
        k -= 1;
        i -= 1;
      }

      for(let col=0; col<nU+1; col++) {
        Q.set(col, k-q-1, Q.get(col, k-q));
      }

      for(let l=1; l<q+1; l++) {
        let ind = k-q+l;
        let alpha = <number>Vbar.get(k+l)-X[j];
        if(iszero(alpha)) {
          for(let col=0; col<nU+1; col++) {
            Q.set(col,ind-1, Q.get(col,ind));
          }
        } else {
          alpha = alpha/(Vbar.getN(k+l)-V.getN(i-q+l));
          for(let col=0; col<nU+1; col++) {
            Q.set(col,ind-1,
              add(
                mul(alpha, Q.get(col,ind-1)),
                mul((1.0-alpha), Q.get(col,ind))
              )
            );
          }
        }
      }
      Vbar.set(k,X[j]);
      k -= 1;
    }
    this.v_knots = Vbar;
    this.cpoints = Q;
  }

  /**
   * Inserts multiple knots into the U and V knot vectors at once
   * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
   */
  refineKnotsUV(uklist:number[], vklist:number[]) {
    this.refineKnotsU(uklist);
    this.refineKnotsV(vklist);
  }

  decomposeU() {
    let p = this.u_degree;
    let q = this.v_degree;
    let U = this.u_knots;
    let V = this.v_knots;
    let mU = U.length-1;
    let mV = V.length-1;
    let nV = mV-q-1;
    let P = this.cpoints;
    let alphas = empty(p);

    let a = p;
    let b = p+1;

    let total_bezier = mU-2*p;
    let Q = empty([total_bezier, p+1, nV+1, this.dimension]);
    let nb = 0; // Counter of Bezier strips along u
    for(let i=0; i<p+1; i++) {
      for(let row=0; row<nV+1; row++) {
        Q.set(nb,i,row, P.get(i,row));
      }
    }

    while(b<mU) {
      let i = b;
      while(b<mU && isequal(U.getN(b+1), U.getN(b))) { // isequal ok?
        b += 1;
      }
      let mult = b-i+1;
      if(mult < p) {
        let numerator = U.getN(b) - U.getN(a); // Numerator of alpha

        // Compute and store alphas
        for(let j=p; j>mult; j--) {
          alphas.set(j-mult-1, numerator/(U.getN(a+j)-U.getN(a)));
        }
        let r = p-mult; // Insert knot r times
        for(let j=1; j<r+1; j++) {
          let save = r-j;
          let s = mult+j;
          for(let k=p; k>s-1; k--) {
            let alpha = alphas.getN(k-s);
            for(let row=0; row<nV+1; row++) {
              Q.set(nb,k,row,
                add(
                  mul(alpha, Q.get(nb,k,row)),
                  mul((1.0-alpha), Q.get(nb,k-1,row))
                )
              );
            }
          }
          if(b<mU) {
            for(let row=0; row<nV+1; row++) {
              Q.set(nb+1, save, row, Q.get(nb,p,row));
            }
          }
        }
      }
      nb += 1;
      if(b<mU) { // Initialize for next segment
        for(let i=p-mult; i<p+1; i++) {
          for(let row=0; row<nV+1; row++) {
            Q.set(nb,i,row, P.get(b-p+i,row));
          }
        }
        a = b
        b += 1
      }
    }
    return Q;
  }

  decomposeV() {
    let p = this.u_degree;
    let q = this.v_degree;
    let U = this.u_knots;
    let V = this.v_knots;
    let mU = U.length-1;
    let mV = V.length-1;
    let nU = mU-p-1;
    let P = this.cpoints;
    let alphas = empty(q);

    let a = q;
    let b = q+1;

    let total_bezier = mV-2*q;
    let Q = empty([total_bezier, nU+1, q+1, this.dimension]);
    let nb = 0; // Counter of Bezier strips along v
    for(let i=0; i<q+1; i++) {
      for(let col=0; col<nU+1; col++) {
        Q.set(nb,col,i, P.get(col,i));
      }
    }

    while(b<mV) {
      let i = b;
      while(b<mV && isequal(V.getN(b+1), V.getN(b))) {
        b += 1;
      }
      let mult = b-i+1;
      if(mult < q) {
        let numerator = V.getN(b) - V.getN(a); // Numerator of alpha

        // Compute and store alphas
        for(let j=q; j>mult; j--) {
          alphas.set(j-mult-1, numerator/(V.getN(a+j)-V.getN(a)));
        }
        let r = q-mult; // Insert knot r times
        for(let j=1; j<r+1; j++) {
          let save = r-j;
          let s = mult+j;
          for(let k=q; k>s-1; k--) {
            let alpha = alphas.getN(k-s);
            for(let col=0; col<nU+1; col++) {
              Q.set(nb,col,k,
                add(
                  mul(alpha, Q.get(nb,col,k)),
                  mul((1.0-alpha), Q.get(nb,col,k-1))
                )
              );
            }
          }
          if(b<mV) {
            for(let col=0; col<nU+1; col++) {
              Q.set(nb+1,col,save, Q.get(nb,col,q));
            }
          }
        }
      }
      nb += 1;
      if(b<mV) { // Initialize next segment
        for(let i=q-mult; i<q+1; i++) {
          for(let col=0; col<nU+1; col++) {
            Q.set(nb,col,i, P.get(col,b-q+i));
          }
        }
        a = b;
        b += 1;
      }
    }
    return Q;
  }

  /**
   * Creates grid of Bezier surfaces that represent this BSpline surface.
   * The routine first computes bezier strips along u (i.e. BSpline surfaces that
   * are Bezier in one direction and BSpline in other). Subsequently 
   * decompose it called on each of these strips in the v direction
   * Algorithm A5.7 from "The NURBS Book"
   * See http://www.bluemathsoftware.com/pages/nurbs/funalgo
   */
  decompose() {
    let Q = this.decomposeU();
    // Using Q, create Bezier strip surfaces. These are individual BSurf objects
    // Their u curve will be bezier, but will still be expressed as BSpline
    // Their v curve will still be bspline
    let L = 2*(this.u_degree+1);
    let u_bez_knots = empty(L);
    for(let i=0; i<this.u_degree+1; i++) {
      u_bez_knots.set(i, 0);
      u_bez_knots.set(L-i-1, 1);
    }
    let bezStrips = [];
    for(let numUBez=0; numUBez<Q.length; numUBez++) {
      let cpoints = Q.getA(numUBez);
      bezStrips.push(new BSplineSurface(
        this.u_degree,this.v_degree,u_bez_knots,this.v_knots, cpoints));
    }

    let bezSurfs = [];
    // Decompose each bezier strip along v
    for(let bezStrip of bezStrips) {
      let Q = bezStrip.decomposeV();
      for(let numUBez=0; numUBez<Q.length; numUBez++) {
        let cpoints = Q.getA(numUBez);
        bezSurfs.push(new BezierSurface(this.u_degree, this.v_degree, cpoints));
      }
    }
    return bezSurfs;
  }

  toString() {
    let s = `BSplineSurf [udeg ${this.u_degree} vdeg ${this.v_degree} \n`+
      `cpoints ${this.cpoints.toString()} \n`+
      `uknots ${this.u_knots.toString()} \n`+
      `vknots ${this.v_knots.toString()} \n`;
    if(this.weights) { // isRational
      s += `weights ${this.weights.toString()}\n`;
    }
    s += ']';
    return s;
  }
}

export {
  BezierSurface,
  BSplineSurface
}
