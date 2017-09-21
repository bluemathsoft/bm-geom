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

import {BSplineSurface} from './bsurf'
import {BSplineCurve} from './bcurve'
import {arr,add,mul,NDArray} from '@bluemath/common'

export class BilinearSurface extends BSplineSurface {

  constructor(p00:number[],p01:number[],p10:number[],p11:number[]) {
    super(1,1,
      arr([0,0,1,1]), arr([0,0,1,1]),
      arr([[p00,p01],[p10,p11]]));
  }

}

export class GeneralCylinder extends BSplineSurface {

  constructor(curve:BSplineCurve, direction:number[], height:number) {

    let cpoints0 = curve.cpoints.toArray();
    let cpoints1 = cpoints0.map((cpoint:number[]) => {
      let cp1 = <NDArray>add(arr(cpoint), mul(arr(direction),height));
      return cp1.toArray();
    });
    let cpoints = [];
    let weights = [];
    for(let i=0; i<cpoints0.length; i++) {
      cpoints.push([cpoints0[i],cpoints1[i]]);
      if(curve.weights) {
        weights.push([curve.weights.getN(i),curve.weights.getN(i)])
      }
    }

    super(curve.degree, 1, curve.knots, arr([0,0,1,1]), cpoints,
      curve.weights ? arr(weights) : undefined
    );
  }

}

export class Cylinder extends GeneralCylinder {

}

export class RuledSurface extends BSplineSurface {

}

export class RevolutionSurface extends BSplineSurface {

}

export class Cone extends RevolutionSurface {

}

export class Sphere extends RevolutionSurface {

}

export class Torus extends RevolutionSurface {

}