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

export const DATA = [
  {
    "groupname" : "Curves",
    "objects" : [
      {
        "name": "Quadratic Bezier 0",
        "type": "BezierCurve",
        "object": {
          "degree": 2,
          "cpoints": [
            [0, 1],
            [1, 0],
            [0, -1]
          ]
        }
      },
      {
        "name": "Cubic Bezier 0",
        "type": "BezierCurve",
        "object": {
          "degree": 3,
          "cpoints": [
            [-3, 1],
            [0, 3],
            [1, -1],
            [3, 3]
          ]
        }
      },
      {
        "name": "Cubic Bezier 1",
        "type": "BezierCurve",
        "object": {
          "degree": 3,
          "cpoints": [
            [1, -3],
            [3, 0],
            [-1, 1],
            [3, 4.5]
          ]
        }
      },
      {
        "name": "Cubic Bezier 2",
        "type": "BezierCurve",
        "object": {
          "degree": 3,
          "cpoints": [
            [0.25, -0.3],
            [0.5, 0.0],
            [0.75, -0.1],
            [1.0, 0.45]
          ]
        }
      },
      {
        "name": "Cubic Bezier 3",
        "type": "BezierCurve",
        "object": {
          "degree": 3,
          "cpoints": [
            [-3, -3],
            [3, 0],
            [-1, 1],
            [3, 4.5]
          ]
        }
      },
      {
        "name": "Cubic Bezier 4",
        "type": "BezierCurve",
        "object": {
          "degree": 3,
          "cpoints": [
            [-2.5, -3],
            [0, 3],
            [1, -1],
            [2.5, 4.5]
          ]
        }
      },
      {
        "name": "Cubic Bezier 3 (3D)",
        "type": "BezierCurve",
        "object": {
          "degree": 3,
          "cpoints": [
            [-3, -3, 0.0],
            [3, 0, 0.0],
            [-1, 1, 0.0],
            [3, 4.5, 0.0]
          ]
        }
      },
      {
        "name": "Cubic Bezier 4 (3D)",
        "type": "BezierCurve",
        "object": {
          "degree": 3,
          "cpoints": [
            [-2.5, -3, 0.0],
            [0, 3, 0.0],
            [1, -1, 0.0],
            [2.5, 4.5, 0.0]
          ]
        }
      },
      {
        "name": "Cubic Bezier 5 (3D)",
        "type": "BezierCurve",
        "object": {
          "degree": 3,
          "cpoints": [
            [-2.5, -3, -1.0],
            [0, 3, 0.0],
            [1, -1, 1.0],
            [-1.5, -4.5, 0]
          ]
        }
      },
      {
        "name": "Rational Bezier 0",
        "type": "BezierCurve",
        "object": {
          "degree": 2,
          "cpoints": [
            [1, 0],
            [1, 1],
            [0, 1]
          ],
          "weights": [
            1, 0.70710678, 1
          ]
        }
      },
      {
        "name": "Rational Bezier 1",
        "type": "BezierCurve",
        "object": {
          "degree": 3,
          "cpoints": [
            [0.5, 0],
            [2, 2.5],
            [3, -2.5],
            [5, 3]
          ],
          "weights": [
            1, 0.5, 2, 1
          ]
        }
      },
      {
        "name": "Simple BSpline 0",
        "type": "BSplineCurve",
        "object": {
          "degree": 2,
          "cpoints": [
            [-5, -5],
            [-2, 0],
            [-1, 5],
            [-0.5, 2],
            [0.5, 2],
            [1, 5],
            [2, 0],
            [5, -5]
          ],
          "knots": [
            0, 0, 0, 0.2, 0.4, 0.6, 0.8, 0.8, 1, 1, 1
          ]
        }
      },
      {
        "name": "Quadratic Bezier as BSpline",
        "type": "BSplineCurve",
        "object": {
          "degree": 2,
          "knots": [0, 0, 0, 1, 1, 1],
          "cpoints": [
            [1, 0],
            [1, 1],
            [0, 1]
          ]
        }
      },
      {
        "name": "Cubic Bezier as BSpline",
        "type": "BSplineCurve",
        "object": {
          "degree": 3,
          "knots": [0, 0, 0, 0, 1, 1, 1, 1],
          "cpoints": [
            [1, 0],
            [0.5, 1],
            [-0.5, 1],
            [-1, 0]
          ]
        }
      },
      {
        "name": "Simple BSpline 1",
        "type": "BSplineCurve",
        "object": {
          "degree": 2,
          "knots": [0, 0, 0, 1, 1, 1],
          "cpoints": [
            [-5, -5],
            [0.5, 2],
            [5, -5]
          ]
        }
      },
      {
        "name": "Simple BSpline 2",
        "type": "BSplineCurve",
        "object": {
          "degree": 3,
          "knots": [0, 0, 0, 0, 0.2, 0.4, 0.6, 0.8, 1, 1, 1, 1],
          "cpoints": [
            [-3, -2],
            [-1, -1],
            [0, -5],
            [3, -5],
            [4, 0],
            [3, 5],
            [0, 5],
            [-1, 1]
          ]
        }
      },
      {
        "name": "Simple BSpline 3",
        "type": "BSplineCurve",
        "object": {
          "degree": 3,
          "knots": [0, 0, 0, 0, 0.25, 0.5, 0.75, 1, 1, 1, 1],
          "cpoints": [
            [-1, 0], [0, 0], [0, 1], [1, 1], [1.5, 0], [1, -1], [0, -1]
          ]
        }
      },
      {
        "name": "Simple BSpline 4",
        "type": "BSplineCurve",
        "object": {
          "degree": 2,
          "knots": [0, 0, 0, 0.2, 0.4, 0.6, 0.8, 1, 1, 1],
          "cpoints": [
            [-1, 0], [-1, 1], [0, 1], [0, -1], [1, -1], [0.75, 0.5], [2, 0.5]
          ]
        }
      },
      {
        "name": "Simple BSpline 5",
        "type": "BSplineCurve",
        "object": {
          "degree": 3,
          "knots": [0, 0, 0, 0, 0.25, 0.5, 0.75, 1, 1, 1, 1],
          "cpoints": [
            [-1, 0], [-1, 1], [0, 1], [0, 0], [1, 0], [1.75, 0.5], [1.2, 1.5]
          ]
        }
      },
      {
        "name": "Simple BSpline 6",
        "type": "BSplineCurve",
        "object": {
          "degree": 3,
          "knots": [0, 0, 0, 0, 0.2, 0.2, 0.3, 1, 1, 1, 1],
          "cpoints": [
            [-1, 0], [-1, 1], [0, 1], [0, 0], [1, 0], [1.75, 0.5], [1.2, 1.5]
          ]
        }
      },
      {
        "name": "Simple BSpline 7",
        "type": "BSplineCurve",
        "object": {
          "degree": 3,
          "knots": [0, 0, 0, 0, 0.7, 0.7, 0.9, 1, 1, 1, 1],
          "cpoints": [
            [-1, 0], [-1, 1], [0, 1], [0, 0], [1, 0], [1.75, 0.5], [1.2, 1.5]
          ]
        }
      },
      {
        "name": "Simple BSpline 8 (3D)",
        "type": "BSplineCurve",
        "object": {
          "degree": 3,
          "knots": [0, 0, 0, 0, 1, 1, 1, 1],
          "cpoints": [
            [-1, -1, 2],
            [-1, 0, 1],
            [1, 1, 1],
            [-1, 2, 0]
          ]
        }
      },
      {
        "name": "Rational BSpline 0",
        "type": "BSplineCurve",
        "object": {
          "degree": 2,
          "knots": [
            0, 0, 0, 0.2, 0.4, 0.6, 0.8, 0.8, 1, 1, 1
          ],
          "cpoints": [
            [-5, -5],
            [-2, 0],
            [-1, 5],
            [-0.5, 2],
            [0.5, 2],
            [1, 5],
            [2, 0],
            [5, -5]
          ],
          "weights": [
            1, 1, 1, 1, 1, 1, 3, 1
          ]
        }
      },
      {
        "name": "Straight line as BSpline",
        "type": "BSplineCurve",
        "object": {
          "degree": 1,
          "knots": [0, 0, 1, 1],
          "cpoints": [
            [0, 0], [4, 5]
          ]
        }
      },
      {
        "name": "Full Circle (4 segments)",
        "type": "BSplineCurve",
        "object": {
          "degree": 2,
          "knots": [0, 0, 0, 0.25, 0.25, 0.5, 0.5, 0.75, 0.75, 1, 1, 1],
          "weights": [
            1, 0.70710678, 1, 0.707106781, 1, 0.707106781, 1, 0.707106781, 1
          ],
          "cpoints": [
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 1],
            [-1, 0],
            [-1, -1],
            [0, -1],
            [1, -1],
            [1, 0]
          ]
        }
      },
      {
        "name": "Full Circle (3 segments)",
        "type": "BSplineCurve",
        "object": {
          "degree": 2,
          "knots": [0, 0, 0, 0.333, 0.333, 0.666, 0.666, 1, 1, 1],
          "weights": [
            1, 0.5, 1, 0.5, 1, 0.5, 1
          ],
          "cpoints": [
            [0.866, 0.5],
            [0, 2],
            [-0.866, 0.5],
            [-1.732, -1],
            [0, -1],
            [1.732, -1],
            [0.866, 0.5]
          ]
        }
      }
    ]
  },
  {
    "groupname" : "Surfaces",
    "objects" : [
      {
        "name" : "Simple Bezier surface 0" ,
        "type" : "BezSurf",
        "object" : {
          "u_degree" : 3,
          "v_degree" : 2,
          "cpoints" : [
            [[-1,-1,0],[0,-1,0],[1,-1,0]],
            [[-1,0,1],[0,0,2],[1,0,-1]],
            [[-1,1,0],[0,1,0],[1,1,0]],
            [[-1,2,0],[0,2,0],[1,2,0]]
          ]
        }
      },
      {
        "name" : "Simple Rational Bezier surface 0" ,
        "type" : "BezSurf",
        "object" : {
          "u_degree" : 3,
          "v_degree" : 2,
          "cpoints" : [
            [[-1,-1,0],[0,-1,0],[1,-1,0]],
            [[-1,0,1],[0,0,2],[1,0,-1]],
            [[-1,1,0],[0,1,0],[1,1,0]],
            [[-1,2,0],[0,2,0],[1,2,0]]
          ],
          "weights" : [
            [1,2,1],
            [1,1,1],
            [3,1,1],
            [1,1,1]
          ]
        }
      },
      {
        "name" : "Simple BSurf 0",
        "type" :"BSurf",
        "object" : {
          "u_degree" : 2,
          "v_degree" : 2,
          "u_knots" : [0,0,0,1,1,1],
          "v_knots" : [0,0,0,1,1,1],
          "cpoints" : [
            [[-1,-1,0],[0,-1,0],[1,-1,0]],
            [[-1,0,1],[0,0,2],[1,0,-1]],
            [[-1,1,0],[0,1,0],[1,1,0]]
          ]
        }
      },
      {
        "name" : "Simple BSurf 1",
        "type" : "BSurf",
        "comment" : "As defined in 'The NURBS book' Fig 5.9",
        "object" : {
          "u_degree" : 3,
          "v_degree" : 2,
          "u_knots" : [0,0,0,0,1,1,1,1],
          "v_knots" : [0,0,0,0.5,1,1,1],
          "cpoints" :[
            [ [-1,-1,2],[0,-1,1],[1,-1,1],[2,-1,1] ],
            [ [-1,0,1],[0,0,1],[1,0,1],[2,0,1] ],
            [ [-1,1,1],[0,1,-1],[1,1,-1],[2,1,-1] ],
            [ [-1,2,0],[0,2,0],[1,2,-1],[2,2,-1] ]
          ]
        }
      },
      {
        "name" : "Simple BSurf 2",
        "type" : "BSurf",
        "comment" : "u goes top-bottom, v goes left-right",
        "object" : {
          "u_degree" : 3,
          "v_degree" : 2,
          "u_knots" : [0,0,0,0,0.5,0.75,1,1,1,1],
          "v_knots" : [0,0,0,0.5,1,1,1],
          "cpoints" :[
            [ [-1,-1,2],[0,-1,1],[1,-1,1],[2,-1,1] ],
            [ [-1,0,1],[0,0,1],[1,0,1],[2,0,1] ],
            [ [-1,1,1],[0,1,-1],[1,1,-1],[2,1,-1] ],
            [ [-1,2,0],[0,2,0],[1,2,-1],[2,2,-1] ],
            [ [-1,3,0],[0,3,0],[1,3,-1],[2,3,-1] ],
            [ [-1,5,0],[0,5,0],[1,5,-1],[2,5,-1] ]
          ]
        }
      },
      {
        "name" : "Rational BSurf",
        "type" : "BSurf",
        "object" : {
          "u_degree" : 3,
          "v_degree" : 2,
          "u_knots" : [0,0,0,0,0.5,0.75,1,1,1,1],
          "v_knots" : [0,0,0,0.5,1,1,1],
          "cpoints" :[
            [ [-1,-1,2],[0,-1,1],[1,-1,1],[2,-1,1] ],
            [ [-1,0,1],[0,0,1],[1,0,1],[2,0,1] ],
            [ [-1,1,1],[0,1,-1],[1,1,-1],[2,1,-1] ],
            [ [-1,2,0],[0,2,0],[1,2,-1],[2,2,-1] ],
            [ [-1,3,0],[0,3,0],[1,3,-1],[2,3,-1] ],
            [ [-1,5,0],[0,5,0],[1,5,-1],[2,5,-1] ]
          ],
          "weights" : [
            [ 1.4, 1, 1, 1 ],
            [ 1, 1, 1, 1 ],
            [ 1, 1, 1, 1 ],
            [ 1, 1, 1, 1 ],
            [ 1, 1, 1, 1 ],
            [ 1, 1, 1, 1 ]
          ]
        }
      }
    ]
  },
  {
    "groupname" : "Specific Curves",
    "objects" : [
      {
        "name" : "Line1",
        "type" : "LineSegment",
        "object" : {
          "from" : [0,1],
          "to" : [0,4]
        }
      },
      {
        "name" : "CircleArc1",
        "type" : "CircleArc",
        "object" : {
          "radius" : 4,
          "coord" : {
            origin : [0,0,0],
            x : [1,0,0],
            z : [0,0,1]
          },
          "start" : Math.PI/4,
          "end" : 3*Math.PI/2
        }
      },
      {
        "name" : "Circle",
        "type" : "Circle",
        "object" : {
          "radius" : 4,
          "coord" : {
            origin : [0,0,0],
            x : [1,0,0],
            z : [0,1,0]
          }
        }
      }
    ]
  },
  {
    "groupname" : "Specific Surfaces",
    "objects" : [
      {
        "name" : "Bilinear Surf 1",
        "type" : "BilinearSurface",
        "object" : {
          p00 : [-1,-1,0],
          p01 : [1,-1,1],
          p10 : [-1,1,1],
          p11 : [1,1,0]
        }
      },
      {
        "name" : "Flat Plane Z_1",
        "type" : "BilinearSurface",
        "object" : {
          p00 : [-1,-1,1],
          p01 : [1,-1,1],
          p10 : [-1,1,1],
          p11 : [1,1,1]
        }
      },
      {
        "name" : "General Cylinder 1",
        "type" : "GeneralCylinder",
        "object" : {
          "curve" : "Simple BSpline 2",
          "direction" : [0,0,1],
          "height" : 2
        }
      },
      {
        "name" : "General Cylinder 2",
        "type" : "GeneralCylinder",
        "object" : {
          "curve" : "Rational BSpline 0",
          "direction" : [0,0,1],
          "height" : 2
        }
      },
      {
        "name" : "Cylinder 1",
        "type" : "Cylinder",
        "object" : {
          "coord" : {
            origin : [0,0,0],
            x : [1,0,0],
            z : [0,1,0]
          },
          "radius" : 2,
          "height" : 4
        }
      },
      {
        "name" : "Cylinder 2",
        "type" : "Cylinder",
        "object" : {
          "coord" : {
            origin : [0,0,0],
            x : [1,0,0],
            z : [0,0,1]
          },
          "radius" : 2,
          "height" : 4
        }
      },
    ]
  },
  {
    "groupname" : "Actions",
    "objects" : [
      {
        "name" : "Split Bezier 0",
        "type" : "Action",
        "object" : {
          "actiontype" : "split_curve",
          "input" : "Cubic Bezier 0",
          "parameter" : 0.4
        }
      },
      {
        "name" : "Split Bezier 1",
        "type" : "Action",
        "object" : {
          "actiontype" : "split_curve",
          "input" : "Cubic Bezier 1",
          "parameter" : 0.4
        }
      },
      {
        "name" : "Insert Knot in Simple BSpline 5",
        "type" : "Action",
        "object" : {
          "actiontype" : "insert_knot_curve",
          "input" : "Simple BSpline 5",
          "knot_to_insert" : 0.6,
          "num_insertions" : 1
        }
      },
      {
        "name" : "Insert 3 Knots in Simple BSpline 5",
        "type" : "Action",
        "object" : {
          "actiontype" : "insert_knot_curve",
          "input" : "Simple BSpline 5",
          "knot_to_insert" : 0.24,
          "num_insertions" : 2
        }
      },
      {
        "name" : "Refine knots of Simple BSpline 5",
        "type" : "Action",
        "object" : {
          "actiontype" : "refine_knot_curve",
          "input" : "Simple BSpline 5",
          "knots_to_add" : [0.6,0.6,0.7]
        }
      },
      {
        "name" : "Subdivide Simple BSpline 5 into two halves",
        "type" : "Action",
        "object" : {
          "actiontype" : "refine_knot_curve",
          "input" : "Simple BSpline 5",
          "knots_to_add" : [0.5,0.5]
        }
      },
      {
        "name" : "Subdivide Simple BSpline 6 into two halves",
        "type" : "Action",
        "object" : {
          "actiontype" : "refine_knot_curve",
          "input" : "Simple BSpline 6",
          "knots_to_add" : [0.5,0.5,0.5]
        }
      },
      {
        "name" : "Subdivide Simple BSpline 7 into two halves",
        "type" : "Action",
        "object" : {
          "actiontype" : "refine_knot_curve",
          "input" : "Simple BSpline 7",
          "knots_to_add" : [0.5,0.5,0.5]
        }
      },
      {
        "name" : "Split Simple BSpline 5 in the middle",
        "type" : "Action",
        "object" : {
          "actiontype" : "split_curve",
          "input" : "Simple BSpline 5",
          "parameter" : 0.5
        }
      },
      {
        "name" : "Split Simple BSpline 6 in the middle",
        "type" : "Action",
        "object" : {
          "actiontype" : "split_curve",
          "input" : "Simple BSpline 6",
          "parameter" : 0.5
        }
      },
      {
        "name" : "Split Simple BSpline 7 in the middle",
        "type" : "Action",
        "object" : {
          "actiontype" : "split_curve",
          "input" : "Simple BSpline 7",
          "parameter" : 0.5
        }
      },
      {
        "name" : "Decompose Simple BSpline 5",
        "type" : "Action",
        "object" : {
          "actiontype" : "decompose_curve",
          "input" : "Simple BSpline 5"
        }
      },

      {
        "name" : "Insert u Knot in Simple BSurf 1",
        "type" : "Action",
        "object" : {
          "actiontype" : "insert_knot_surf",
          "input" : "Simple BSurf 1",
          "u_knot_to_insert" : 0.5,
          "num_insertions_u" : 1
        }
      },
      {
        "name" : "Insert v Knot in Simple BSurf 1",
        "type" : "Action",
        "object" : {
          "actiontype" : "insert_knot_surf",
          "input" : "Simple BSurf 1",
          "v_knot_to_insert" : 0.5,
          "num_insertions_v" : 1
        }
      },
      {
        "name" : "Refine u Knot in Simple BSurf 1",
        "type" : "Action",
        "object" : {
          "actiontype" : "refine_knot_surf",
          "input" : "Simple BSurf 1",
          "u_knots_to_add" : [0.3,0.5,0.5]
        }
      },
      {
        "name" : "Refine v Knot in Simple BSurf 1",
        "type" : "Action",
        "object" : {
          "actiontype" : "refine_knot_surf",
          "input" : "Simple BSurf 1",
          "v_knots_to_add" : [0.5,0.9,0.9]
        }
      },
      {
        "name" : "Decompose Simple BSurf 1",
        "type" : "Action",
        "object" : {
          "actiontype" : "decompose_surf",
          "input" : "Simple BSurf 1"
        }
      },
      {
        "name" : "Decompose Simple BSurf 2",
        "type" : "Action",
        "object" : {
          "actiontype" : "decompose_surf",
          "input" : "Simple BSurf 2"
        }
      },
      {
        "name" : "Split Simple BSurf 2 at uk",
        "type" : "Action",
        "object" : {
          "actiontype" : "split_u_surf",
          "input" : "Simple BSurf 2",
          "u_split" : 0.6
        }
      },
      {
        "name" : "Split Simple BSurf 2 at vk",
        "type" : "Action",
        "object" : {
          "actiontype" : "split_v_surf",
          "input" : "Simple BSurf 2",
          "v_split" : 0.6
        }
      },
      {
        "name" : "Split Simple BSurf 2 at uk and vk",
        "type" : "Action",
        "object" : {
          "actiontype" : "split_uv_surf",
          "input" : "Simple BSurf 2",
          "u_split" : 0.5,
          "v_split" : 0.6
        }
      },
      {
        "name" : "Tessellate Simple BSurf 1 adaptively",
        "type" : "Action",
        "object" : {
          "actiontype" : "tess_adaptive_bsurf",
          "input" : "Simple BSurf 1"
        }
      },
      {
        "name" : "Tessellate Simple BSurf 2 adaptively",
        "type" : "Action",
        "object" : {
          "actiontype" : "tess_adaptive_bsurf",
          "input" : "Simple BSurf 2"
        }
      }
    ]
  }
];


