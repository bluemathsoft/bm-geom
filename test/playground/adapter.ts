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

import {
  BezierCurve, BSplineCurve, BezierSurface, BSplineSurface,
  LineSegment, CircleArc, Circle,
  BilinearSurface, GeneralCylinder
} from '../../src/nurbs'
import {
  CoordSystem
} from '../../src'
import {arr,NDArray, AABB} from '@bluemath/common'
import {Renderer} from './renderer'

const RESOLUTION = 100;

function buildGeometry(data:any, type:string,
  DATA_MAP:any, nameToKey:(s:string)=>string)
{
  switch(type) {
  case 'BezierCurve':
    return new BezierCurve(
      data.degree,
      arr(data.cpoints),
      data.weights?arr(data.weights):undefined);
  case 'BSplineCurve':
    if(!data.knots) {
      // Assume it's a bezier curve
      data.knots = [];
      for(let i=0; i<=data.degree; i++) {
        data.knots.push(0);
      }
      for(let i=0; i<=data.degree; i++) {
        data.knots.push(1);
      }
    }
    let {degree, cpoints, knots} = data;

    return new BSplineCurve(degree,
      arr(cpoints), arr(knots),
      data.weights ? arr(data.weights) : undefined);
  case 'BezSurf':
    return new BezierSurface(
      data.u_degree, data.v_degree, arr(data.cpoints));
  case 'BSurf':
    return new BSplineSurface(
      data.u_degree, data.v_degree,
      arr(data.u_knots), arr(data.v_knots), arr(data.cpoints),
      data.weights ? arr(data.weights) : undefined
    );
  case "LineSegment":
    return new LineSegment(data.from, data.to);
  case "CircleArc":
    return new CircleArc(
      new CoordSystem(data.coord.origin,data.coord.x,data.coord.z),
      data.radius,data.start,data.end);
  case "Circle":
    return new Circle(
      new CoordSystem(data.coord.origin,data.coord.x,data.coord.z),
      data.radius);
  case "BilinearSurface":
    return new BilinearSurface(data.p00,data.p01,data.p10,data.p11);
  case "GeneralCylinder":
    let curveData = typeof data.curve === 'string' ?
      DATA_MAP[nameToKey(data.curve)] : data.curve;
    let curve:BSplineCurve;
    if(curveData.type === 'BSplineCurve') {
      let d = curveData.object;
      curve = new BSplineCurve(d.degree, arr(d.cpoints), arr(d.knots),
        d.weights ? arr(d.weights) : undefined);
      if(curve.dimension === 2) { curve.to3D(); }
    } else {
      console.assert(false);
    }
    return new GeneralCylinder(curve!, data.direction, data.height);
  default:
    throw new Error('Not implemented');
  }
}

function genBezierCurveTess(bezcrv:BezierCurve) : NDArray {
  return bezcrv.tessellate(RESOLUTION);
}

function genBezierPlotTraces(bezcrv:BezierCurve,axes=['x1','y1']) {
  let tess = bezcrv.tessellateAdaptive(0.01);
  return [
    {
      x: Array.from(tess.getA(':',0).data),
      y: Array.from(tess.getA(':',1).data),
      xaxis : axes[0],
      yaxis : axes[1],
      type : 'scatter',
      mode : 'lines',
      name:'Curve'
    },
    {
      x: Array.from(bezcrv.cpoints.getA(':',0).data),
      y: Array.from(bezcrv.cpoints.getA(':',1).data),
      xaxis : axes[0],
      yaxis : axes[1],
      type : 'scatter',
      mode : 'markers',
      name:'Control Points'
    }
  ];
}

function genBSplineCurveTess(bcrv:BSplineCurve) {
  return bcrv.tessellate(RESOLUTION);
}

function genBSplinePlotTraces(bcrv:BSplineCurve,axes=['x1','y1']) {
  let tess = bcrv.tessellate(RESOLUTION);
  return [
    {
      x: Array.from(tess.getA(':',0).data),
      y: Array.from(tess.getA(':',1).data),
      xaxis : axes[0],
      yaxis : axes[1],
      type : 'scatter',
      mode : 'lines',
      name:'Curve'
    },
    {
      x: Array.from(bcrv.cpoints.getA(':',0).data),
      y: Array.from(bcrv.cpoints.getA(':',1).data),
      xaxis : axes[0],
      yaxis : axes[1],
      type : 'scatter',
      mode : 'markers',
      name:'Control Points'
    }
  ]
}

export class GeometryAdapter {

  rndr : Renderer;

  constructor(div:HTMLElement, geomdata:any,
    DATA_MAP:any,
    nameToKey:(s:string)=>string)
  {
    let geom = buildGeometry(
      geomdata.object, geomdata.type, DATA_MAP, nameToKey);
    let is3D = geom.dimension === 3;

    console.assert(geom);
    this.rndr = new Renderer(div, is3D ? 'threejs':'plotly');

    switch(geomdata.type) {
    case 'BezierCurve':
      if(is3D) {
        let tess = genBezierCurveTess(<BezierCurve>geom);
        this.rndr.render3D({
          line : tess.toArray(),
          points : (<BezierCurve>geom).cpoints.toArray()
        });
      } else {
        this.rndr.render2D(
          genBezierPlotTraces(<BezierCurve>geom),computeRange([geom]));
      }
      break;
    case 'BSplineCurve':
    case 'LineSegment':
    case 'CircleArc':
    case 'Circle':
      if(is3D) {
        let tess = genBSplineCurveTess(<BSplineCurve>geom);
        this.rndr.render3D({
          line : tess.toArray(),
          points : (<BSplineCurve>geom).cpoints.toArray()
        });
      } else {
        this.rndr.render2D(
          genBSplinePlotTraces(<BSplineCurve>geom), computeRange([geom]));
      }
      break;
    case 'BezSurf':
    case 'BSurf':
    case 'BilinearSurface':
    case 'GeneralCylinder':
      let [nrows,ncols] = (<BSplineSurface>geom).cpoints.shape;
      let cpointsArr = (<BSplineSurface>geom)
        .cpoints.clone().reshape([nrows*ncols,3]);
      this.rndr.render3D({
        mesh:(<BSplineSurface>geom).tessellate(),
        points:cpointsArr.toArray()
      });
      break;
    }
  }
}

function computeRange(
  geoms:Array<BezierCurve|BSplineCurve|BezierSurface|BSplineSurface>)
{
  if(geoms[0].dimension === 2) {
    let aabb:AABB|undefined = undefined;
    for(let geom of geoms) {
      if(aabb) {
        (<AABB>aabb).merge(geom.aabb());
      } else {
        aabb = geom.aabb();
      }
    }
    let xmin = aabb!.min.getN(0);
    let ymin = aabb!.min.getN(1);
    let xmax = aabb!.max.getN(0);
    let ymax = aabb!.max.getN(1);
    let xspan = xmax-xmin;
    let yspan = ymax-ymin;
    return {
      x : [xmin-0.1*xspan, xmax+0.1*xspan],
      y : [ymin-0.1*xspan, ymax+0.1*yspan]
    }
  } else {
    throw new Error('TODO');
  }
}

export class ActionAdapter {

  constructor(div:HTMLElement, data:any,
    DATA_MAP:any,
    nameToKey:(s:string)=>string)
  {
    let aobject = data.object;
    let igeomdata = DATA_MAP[nameToKey(aobject.input)];
    let geom = buildGeometry(
      igeomdata.object, igeomdata.type, DATA_MAP, nameToKey);
    let is3D = geom.dimension === 3;
    let rndr = new Renderer(div,is3D?'threejs':'plotly',true);

    switch(aobject.actiontype) {
    case 'split_curve':
      let [left,right] = (<BezierCurve>geom).split(aobject.parameter);
      rndr.render2D([
        ...genBezierPlotTraces(<BezierCurve>geom,['x1','y1']),
        ...genBezierPlotTraces(<BezierCurve>left,['x2','y2']),
        ...genBezierPlotTraces(<BezierCurve>right,['x2','y2']),
      ],computeRange([geom]));
      break;
    case 'insert_knot_curve':
      {
        let result = geom.clone();
        (<BSplineCurve>result).insertKnot(
          aobject.knot_to_insert,aobject.num_insertions);
        rndr.render2D([
          ...genBSplinePlotTraces(<BSplineCurve>geom,['x1','y1']),
          ...genBSplinePlotTraces(<BSplineCurve>result,['x2','y2']),
        ],computeRange([geom]));
      }
      break;
    case 'refine_knot_curve':
      {
        let result = geom.clone();
        (<BSplineCurve>result).refineKnots(aobject.knots_to_add);
        rndr.render2D([
          ...genBSplinePlotTraces(<BSplineCurve>geom,['x1','y1']),
          ...genBSplinePlotTraces(<BSplineCurve>result,['x2','y2']),
        ],computeRange([geom]));
      }
      break;
    case 'decompose_curve':
      {
        let result = (<BSplineCurve>geom).decompose();
        rndr.render2D([
          ...genBSplinePlotTraces(<BSplineCurve>geom,['x1','y1']),
          ...result.reduce((total:any[],cursor) => {
            return total.concat(
              genBezierPlotTraces(<BezierCurve>cursor,['x2','y2']));
          },[]),
        ],computeRange([geom]));
      }
      break;
    }

  }
}