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

import {BSplineSurface} from './bsurf'
import {BSplineCurve} from './bcurve'
import {Circle} from './curve'
import {arr,add,mul,NDArray} from '@bluemath/common'
import {CoordSystem} from '..'

export class BilinearSurface extends BSplineSurface {

  constructor(p00:number[],p01:number[],p10:number[],p11:number[]) {
    super(1,1,
      arr([0,0,1,1]), arr([0,0,1,1]),
      arr([[p00,p01],[p10,p11]]));
  }

}

export class GeneralCylinder extends BSplineSurface {

  constructor(curve:BSplineCurve, direction:NDArray|number[], height:number) {

    let dir = direction instanceof NDArray ? direction : arr(direction);
    let cpoints0 = curve.cpoints.toArray();
    let cpoints1 = cpoints0.map((cpoint:number[]) => {
      let cp1 = <NDArray>add(arr(cpoint), mul(dir,height));
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

  constructor(coordsys:CoordSystem, radius:number, height:number) {
    let circle = new Circle(coordsys, radius);
    super(circle,coordsys.z,height);
  }

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
