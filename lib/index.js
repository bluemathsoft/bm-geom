"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const nurbs = require("./nurbs");
exports.nurbs = nurbs;
const common_1 = require("@bluemath/common");
class Axis {
}
exports.Axis = Axis;
class CoordSystem {
    constructor(origin, x, z) {
        this.origin = origin instanceof common_1.NDArray ? origin : common_1.arr(origin);
        this.x = x instanceof common_1.NDArray ? x : common_1.arr(x);
        this.z = z instanceof common_1.NDArray ? z : common_1.arr(z);
        this.y = common_1.cross(this.z, this.x);
    }
}
exports.CoordSystem = CoordSystem;
