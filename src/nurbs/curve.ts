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
  intersectLineSegLineSeg3D
} from './helper'
import {BSplineCurve} from './bcurve'
import {CoordSystem} from '..'
import {
  NDArray, add, mul, arr
} from '@bluemath/common'

export class LineSegment extends BSplineCurve {
  constructor(from:number[],to:number[]) {
    super(1,arr([from,to]),arr([0,0,1,1]));
  }
}

export class CircleArc extends BSplineCurve {
  constructor(coordsys:CoordSystem, radius:number, start:number, end:number) {
    let O = coordsys.origin;
    let X = coordsys.x;
    let Y = coordsys.y;
    if(end < start) {
      end = end + 2*Math.PI;
    }
    let theta = end-start;

    let narcs;
    if(theta <= Math.PI/2) {
      narcs = 1;
    } else if(theta <= Math.PI) {
      narcs = 2;
    } else if(theta <= 3*Math.PI/2) {
      narcs = 3;
    } else {
      narcs = 4;
    }
    let dtheta = theta/narcs;

    let n = 2*narcs; // n+1 control points
    let p = 2; // Degree
    let m = n+p+1;
    let U = new NDArray({shape:[m+1]});
    let P = new NDArray({shape:[n+1,3]});
    let wt = new NDArray({shape:[n+1]});

    let w1 = Math.cos(dtheta/2); // dtheta/2 is the base angle
    let P0 = <NDArray>add(O,add(
      mul(radius,Math.cos(start),X),mul(radius,Math.sin(start),Y)
    ));
    let T0 = <NDArray>add(
      mul(-Math.sin(start),X),mul(Math.cos(start),Y));
    P.set(0,P0);
    wt.set(0,1);
    let index = 0;
    let angle = start;

    for(let i=1; i<narcs+1; i++) {
      angle += dtheta;
      let P2 = <NDArray>add(O,
        mul(radius, Math.cos(angle), X), mul(radius, Math.sin(angle), Y));
      P.set(index+2, P2);
      wt.set(index+2, 1);
      let T2 = <NDArray>add(mul(-Math.sin(angle),X), mul(Math.cos(angle),Y));
      let isect = intersectLineSegLineSeg3D(
        P0.toArray(),
        (<NDArray>add(P0,T0)).toArray(),
        P2.toArray(),
        (<NDArray>add(P2,T2)).toArray(),
      );
      if(!isect) {
        throw new Error('Intersection in 3D failed');
      }
      let pti = <NDArray>add(P0, mul(T0,isect[0]));
      P.set(index+1,pti);
      wt.set(index+1,w1);

      index += 2;
      if(i < narcs) {
        P0 = P2;
        T0 = T2;
      }
    }
    let j = 2*narcs+1;
    for(let i=0; i<3; i++) {
      U.set(i,0.0);
      U.set(i+j,1.0);
    }

    if(narcs === 1) {
    } else if(narcs === 2) {
      U.set(3, 0.5);
      U.set(4, 0.5);
    } else if(narcs === 3) {
      U.set(3, 1/3);
      U.set(4, 1/3);
      U.set(5, 2/3);
      U.set(6, 2/3);
    } else if(narcs === 4) {
      U.set(3, 0.25);
      U.set(4, 0.25);
      U.set(5, 0.5);
      U.set(6, 0.5);
      U.set(7, 0.75);
      U.set(8, 0.75);
    }
    super(p,P,U,wt);
  }
}

export class Circle extends CircleArc {
  constructor(coord:CoordSystem, radius:number) {
    super(coord,radius, 0, 2*Math.PI);
  }
}
