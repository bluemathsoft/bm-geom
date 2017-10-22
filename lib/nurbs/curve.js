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
const helper_1 = require("./helper");
const bcurve_1 = require("./bcurve");
const common_1 = require("@bluemath/common");
class LineSegment extends bcurve_1.BSplineCurve {
    constructor(from, to) {
        super(1, common_1.arr([from, to]), common_1.arr([0, 0, 1, 1]));
    }
}
exports.LineSegment = LineSegment;
class CircleArc extends bcurve_1.BSplineCurve {
    constructor(coordsys, radius, start, end) {
        let O = coordsys.origin;
        let X = coordsys.x;
        let Y = coordsys.y;
        if (end < start) {
            end = end + 2 * Math.PI;
        }
        let theta = end - start;
        let narcs;
        if (theta <= Math.PI / 2) {
            narcs = 1;
        }
        else if (theta <= Math.PI) {
            narcs = 2;
        }
        else if (theta <= 3 * Math.PI / 2) {
            narcs = 3;
        }
        else {
            narcs = 4;
        }
        let dtheta = theta / narcs;
        let n = 2 * narcs; // n+1 control points
        let p = 2; // Degree
        let m = n + p + 1;
        let U = new common_1.NDArray({ shape: [m + 1] });
        let P = new common_1.NDArray({ shape: [n + 1, 3] });
        let wt = new common_1.NDArray({ shape: [n + 1] });
        let w1 = Math.cos(dtheta / 2); // dtheta/2 is the base angle
        let P0 = common_1.add(O, common_1.add(common_1.mul(radius, Math.cos(start), X), common_1.mul(radius, Math.sin(start), Y)));
        let T0 = common_1.add(common_1.mul(-Math.sin(start), X), common_1.mul(Math.cos(start), Y));
        P.set(0, P0);
        wt.set(0, 1);
        let index = 0;
        let angle = start;
        for (let i = 1; i < narcs + 1; i++) {
            angle += dtheta;
            let P2 = common_1.add(O, common_1.mul(radius, Math.cos(angle), X), common_1.mul(radius, Math.sin(angle), Y));
            P.set(index + 2, P2);
            wt.set(index + 2, 1);
            let T2 = common_1.add(common_1.mul(-Math.sin(angle), X), common_1.mul(Math.cos(angle), Y));
            let isect = helper_1.intersectLineSegLineSeg3D(P0.toArray(), common_1.add(P0, T0).toArray(), P2.toArray(), common_1.add(P2, T2).toArray());
            if (!isect) {
                throw new Error('Intersection in 3D failed');
            }
            let pti = common_1.add(P0, common_1.mul(T0, isect[0]));
            P.set(index + 1, pti);
            wt.set(index + 1, w1);
            index += 2;
            if (i < narcs) {
                P0 = P2;
                T0 = T2;
            }
        }
        let j = 2 * narcs + 1;
        for (let i = 0; i < 3; i++) {
            U.set(i, 0.0);
            U.set(i + j, 1.0);
        }
        if (narcs === 1) {
        }
        else if (narcs === 2) {
            U.set(3, 0.5);
            U.set(4, 0.5);
        }
        else if (narcs === 3) {
            U.set(3, 1 / 3);
            U.set(4, 1 / 3);
            U.set(5, 2 / 3);
            U.set(6, 2 / 3);
        }
        else if (narcs === 4) {
            U.set(3, 0.25);
            U.set(4, 0.25);
            U.set(5, 0.5);
            U.set(6, 0.5);
            U.set(7, 0.75);
            U.set(8, 0.75);
        }
        super(p, P, U, wt);
    }
}
exports.CircleArc = CircleArc;
class Circle extends CircleArc {
    constructor(coord, radius) {
        super(coord, radius, 0, 2 * Math.PI);
    }
}
exports.Circle = Circle;
