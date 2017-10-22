

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

import {NDArray,arr} from '@bluemath/common'

import {
  BSplineCurve, BezierCurve, BSplineSurface
} from '../src/nurbs'
import {
  planeFrom3Points, intersectLineSegLineSeg3D
} from '../src/nurbs/helper'

export default function testNURBS() {

  QUnit.module('Helper', () => {
    QUnit.module('planeFrom3Points', () => {
      QUnit.test('XY plane',assert=> {
        assert.deepEqual(planeFrom3Points(
          arr([0,0,0]),
          arr([5,0,0]),
          arr([0,5,0])
        ), [0,0,1,0]);
        assert.deepEqual(planeFrom3Points(
          arr([0,0,0]),
          arr([0,5,0]),
          arr([5,0,0])
        ), [0,0,-1,0]);
        assert.deepEqual(planeFrom3Points(
          arr([0,0,3]),
          arr([0,5,3]),
          arr([5,0,3])
        ), [0,0,-1,3]);
        assert.deepEqual(planeFrom3Points(
          arr([0,0,3]),
          arr([5,0,3]),
          arr([0,5,3])
        ), [0,0,1,-3]);
      });
      QUnit.test('XZ plane',assert=> {
        assert.deepEqual(planeFrom3Points(
          arr([0,0,0]),
          arr([5,0,0]),
          arr([0,0,5])
        ), [0,-1,0,0]);
        assert.deepEqual(planeFrom3Points(
          arr([0,0,0]),
          arr([0,0,5]),
          arr([5,0,0])
        ), [0,1,0,0]);
        assert.deepEqual(planeFrom3Points(
          arr([0,2,0]),
          arr([0,2,5]),
          arr([5,2,0])
        ), [0,1,0,-2]);
        assert.deepEqual(planeFrom3Points(
          arr([0,2,0]),
          arr([5,2,0]),
          arr([0,2,5])
        ), [0,-1,0,2]);
      });
      QUnit.test('YZ plane',assert=> {
        assert.deepEqual(planeFrom3Points(
          arr([0,0,0]),
          arr([0,5,0]),
          arr([0,0,5])
        ), [1,0,0,0]);
        assert.deepEqual(planeFrom3Points(
          arr([0,0,0]),
          arr([0,0,5]),
          arr([0,5,0])
        ), [-1,0,0,0]);
        assert.deepEqual(planeFrom3Points(
          arr([2,0,0]),
          arr([2,0,5]),
          arr([2,5,0])
        ), [-1,0,0,2]);
        assert.deepEqual(planeFrom3Points(
          arr([2,0,0]),
          arr([2,5,0]),
          arr([2,0,5])
        ), [1,0,0,-2]);
      });
      QUnit.test('Oblique plane',assert=> {
        {
          let [a,b,c] = planeFrom3Points(
            arr([1,0,0]),
            arr([0,1,0]),
            arr([0,0,1])
          );
          assert.ok(a>0 && b>0 && c>0);
        }
        {
          let [a,b,c] = planeFrom3Points(
            arr([0,1,0]),
            arr([1,0,0]),
            arr([0,0,1])
          );
          assert.ok(a<0 && b<0 && c<0);
        }
      });
    });
    QUnit.module('intersectLineSegLineSeg3D', () => {
      QUnit.test('_',assert=> {
        let result;
        result = intersectLineSegLineSeg3D(
          [0, 0, 0], [1, 0, 0], [0, 0, 0], [0, 1, 0]);
        assert.deepEqual(result, [0,0]);
        result = intersectLineSegLineSeg3D(
          [0, 0, 0], [1, 1, 0], [0, 1, 0], [1, 0, 0]);
        assert.deepEqual(result, [0.5,0.5]);
        result = intersectLineSegLineSeg3D(
          [0, 0, 0], [1, 1, 0], [0, 1, 1], [1, 0, 1]);
        assert.equal(result, null);
        result = intersectLineSegLineSeg3D(
          [0, 0, 0], [1, 1, 1], [0, 1, 0], [1, 0, 1]);
        assert.deepEqual(result, [0.5,0.5]);
        result = intersectLineSegLineSeg3D(
          [0, 0, 0], [1, 1, 1], [1, 0, 0], [2, 1, 1]);
        assert.equal(result, null);
        result = intersectLineSegLineSeg3D(
          [0, 0, 0], [1, 1, 1], [1, 1, 0], [2, 0, 1]);
        assert.equal(result, null);
      });
    });
  });

  QUnit.module('NURBS', () => {
    QUnit.module('Bezier2D', () => {
      QUnit.test('construction', assert => {
        let bezcrv = new BezierCurve(3,arr([
          [0,0],[1,3],[2,-3],[3,1]
        ]));
        assert.ok(!!bezcrv);
      });
      QUnit.test('isStraight', assert => {
        let bezcrv = new BezierCurve(3,arr([
          [0,0],[1,3],[2,-3],[3,1]
        ]));
        assert.ok(!bezcrv.isLine());

        bezcrv = new BezierCurve(3,arr([
          [0,0],[1,1],[2,2],[5,5]
        ]));
        assert.ok(bezcrv.isLine());

        bezcrv = new BezierCurve(1,arr([
          [0,0],[5,5]
        ]));
        assert.ok(bezcrv.isLine());

        bezcrv = new BezierCurve(2,arr([
          [0,0],[5,1e-3],[10,0]
        ]));
        assert.ok(!bezcrv.isLine());
        assert.ok(bezcrv.isLine(1e-2));
      });
      
      QUnit.skip('computeZeroCurvatureLocations', assert => {
        let bezcrv = new BezierCurve(3, arr([
          [0,0],[3,3],[6,3],[9,0]
        ]));
        console.log(bezcrv.computeZeroCurvatureLocations());
        assert.ok(true);
      });

    });
    QUnit.module('BSplineCurve2D', () => {
      QUnit.test('construction', assert => {
        let bcrv = new BSplineCurve(1,
          new NDArray([[0,0],[10,10]]), new NDArray([0,0,1,1]));
        assert.ok(!!bcrv);
        assert.equal(bcrv.degree, 1);
        assert.equal(bcrv.cpoints.shape[0], 2);
        assert.equal(bcrv.knots.shape[0], 4);
      });
    });
    QUnit.module('BSpline Surf 3D', () => {
      QUnit.test('isFlat', assert => {
        let bsrf = new BSplineSurface(2,2,
          [0,0,0,1,1,1],
          [0,0,0,1,1,1],
          [
            [[-1,-1,0],[0,-1,0],[1,-1,0]],
            [[-1,0,1],[0,0,2],[1,0,-1]],
            [[-1,1,0],[0,1,0],[1,1,0]]
          ]
        );
        assert.ok(!bsrf.isFlat(1));
        assert.ok(bsrf.isFlat(3));

        bsrf = new BSplineSurface(1,1,
          [0,0,1,1],
          [0,0,1,1],
          [
            [[-1,-1,0],[0,-1,0]],
            [[-1,0,0],[0,0,0]],
          ]
        );
        assert.ok(bsrf.isFlat(0));
      });
    });
  });
}
