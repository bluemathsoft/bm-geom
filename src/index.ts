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

import * as nurbs from './nurbs'
import {NDArray,arr,cross} from '@bluemath/common'

class Axis {
  origin : NDArray;
  z : NDArray;
}

class CoordSystem {
  origin : NDArray;
  z : NDArray;
  x : NDArray;
  y : NDArray;

  constructor(origin:NDArray|number[],
    x:NDArray|number[], z:NDArray|number[])
  {
    this.origin = origin instanceof NDArray ? origin : arr(origin);
    this.x = x instanceof NDArray ? x : arr(x);
    this.z = z instanceof NDArray ? z : arr(z);
    this.y = cross(this.z,this.x);
  }
}

export {
  nurbs,
  Axis,
  CoordSystem
};
