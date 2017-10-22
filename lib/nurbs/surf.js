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
const bsurf_1 = require("./bsurf");
const curve_1 = require("./curve");
const common_1 = require("@bluemath/common");
class BilinearSurface extends bsurf_1.BSplineSurface {
    constructor(p00, p01, p10, p11) {
        super(1, 1, common_1.arr([0, 0, 1, 1]), common_1.arr([0, 0, 1, 1]), common_1.arr([[p00, p01], [p10, p11]]));
    }
}
exports.BilinearSurface = BilinearSurface;
class GeneralCylinder extends bsurf_1.BSplineSurface {
    constructor(curve, direction, height) {
        let dir = direction instanceof common_1.NDArray ? direction : common_1.arr(direction);
        let cpoints0 = curve.cpoints.toArray();
        let cpoints1 = cpoints0.map((cpoint) => {
            let cp1 = common_1.add(common_1.arr(cpoint), common_1.mul(dir, height));
            return cp1.toArray();
        });
        let cpoints = [];
        let weights = [];
        for (let i = 0; i < cpoints0.length; i++) {
            cpoints.push([cpoints0[i], cpoints1[i]]);
            if (curve.weights) {
                weights.push([curve.weights.getN(i), curve.weights.getN(i)]);
            }
        }
        super(curve.degree, 1, curve.knots, common_1.arr([0, 0, 1, 1]), cpoints, curve.weights ? common_1.arr(weights) : undefined);
    }
}
exports.GeneralCylinder = GeneralCylinder;
class Cylinder extends GeneralCylinder {
    constructor(coordsys, radius, height) {
        let circle = new curve_1.Circle(coordsys, radius);
        super(circle, coordsys.z, height);
    }
}
exports.Cylinder = Cylinder;
class RuledSurface extends bsurf_1.BSplineSurface {
}
exports.RuledSurface = RuledSurface;
class RevolutionSurface extends bsurf_1.BSplineSurface {
}
exports.RevolutionSurface = RevolutionSurface;
class Cone extends RevolutionSurface {
}
exports.Cone = Cone;
class Sphere extends RevolutionSurface {
}
exports.Sphere = Sphere;
class Torus extends RevolutionSurface {
}
exports.Torus = Torus;
