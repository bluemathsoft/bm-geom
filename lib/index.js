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
Object.defineProperty(exports, "__esModule", { value: true });
var nurbs = require("./nurbs");
exports.nurbs = nurbs;
var common_1 = require("@bluemath/common");
var Axis = /** @class */ (function () {
    function Axis() {
    }
    return Axis;
}());
exports.Axis = Axis;
var CoordSystem = /** @class */ (function () {
    function CoordSystem(origin, x, z) {
        this.origin = origin instanceof common_1.NDArray ? origin : common_1.arr(origin);
        this.x = x instanceof common_1.NDArray ? x : common_1.arr(x);
        this.z = z instanceof common_1.NDArray ? z : common_1.arr(z);
        this.y = common_1.cross(this.z, this.x);
    }
    return CoordSystem;
}());
exports.CoordSystem = CoordSystem;
