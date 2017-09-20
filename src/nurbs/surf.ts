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
import {arr} from '@bluemath/common'

export class BilinearSurface extends BSplineSurface {

  constructor(p00:number[],p01:number[],p10:number[],p11:number[]) {
    super(1,1,
      arr([0,0,1,1]), arr([0,0,1,1]),
      arr([[p00,p01],[p10,p11]]));
  }

}

export class GeneralCylinder extends BSplineSurface {

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