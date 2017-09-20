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
  LineSegment, CircleArc, Circle
} from '../../src/nurbs'
import {
  CoordSystem
} from '../../src'
import {arr} from '@bluemath/common'
import {Renderer} from './renderer'

const RESOLUTION = 100;

export class GeometryAdapter {

  rndr : Renderer;

  constructor(div:HTMLElement, geomdata:any) {
    let is3D = false;
    let geom;
    let data = geomdata.object;
    switch(geomdata.type) {
    case 'BezierCurve':
      geom = new BezierCurve(
        data.degree,
        arr(data.cpoints),
        data.weights?arr(data.weights):undefined);
      is3D = geom.dimension === 3;
      break;
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

      geom = new BSplineCurve(degree,
        arr(cpoints), arr(knots),
        data.weights ? arr(data.weights) : undefined);
      is3D = geom.dimension === 3;
      break;
    case 'BezSurf':
      geom = new BezierSurface(
        data.u_degree, data.v_degree, arr(data.cpoints));
      is3D = true;
      break;
    case 'BSurf':
      geom = new BSplineSurface(
        data.u_degree, data.v_degree,
        arr(data.u_knots), arr(data.v_knots), arr(data.cpoints),
        data.weights ? arr(data.weights) : undefined
      );
      is3D = true;
      break;
    case "LineSegment":
      geom = new LineSegment(data.from, data.to);
      is3D = geom.dimension === 3;
      break;
    case "CircleArc":
      geom = new CircleArc(
        new CoordSystem(data.coord.origin,data.coord.x,data.coord.z),
        data.radius,data.start,data.end);
      is3D = geom.dimension === 3;
      break;
    case "Circle":
      geom = new Circle(
        new CoordSystem(data.coord.origin,data.coord.x,data.coord.z),
        data.radius);
      is3D = geom.dimension === 3;
      break;
    }

    this.rndr = new Renderer(div, is3D ? 'threejs':'plotly');

    switch(geomdata.type) {
    case 'BezierCurve':
      if(is3D) {
        let tess = this.genBezierCurveTess(<BezierCurve>geom);
        this.rndr.render3D({
          line : tess.toArray(),
          points : (<BezierCurve>geom).cpoints.toArray()
        });
      } else {
        this.rndr.render2D(this.genBezierPlotTraces(<BezierCurve>geom));
      }
      break;
    case 'BSplineCurve':
    case "LineSegment":
    case "CircleArc":
    case "Circle":
      if(is3D) {
        let tess = this.genBSplineCurveTess(<BSplineCurve>geom);
        this.rndr.render3D({
          line : tess.toArray(),
          points : (<BSplineCurve>geom).cpoints.toArray()
        });
      } else {
        this.rndr.render2D(this.genBSplinePlotTraces(<BSplineCurve>geom));
      }
      break;
    case 'BezSurf':
    case 'BSurf':
      let [nrows,ncols] = geom.cpoints.shape;
      let cpointsArr = geom.cpoints.clone().reshape([nrows*ncols,3]);
      this.rndr.render3D({
        mesh:geom.tessellate(),
        points:cpointsArr.toArray()
      });
      break;
    }
  }

  render(data) {
  }

  genBezierCurveTess(bezcrv:BezierCurve) {
    return bezcrv.tessellate(RESOLUTION);
  }

  genBezierPlotTraces(bezcrv:BezierCurve) {
    let traces = [];  
    let tess = bezcrv.tessellateAdaptive(0.01);

    traces.push({
      x: Array.from(tess.getA(':',0).data),
      y: Array.from(tess.getA(':',1).data),
      xaxis : 'x1',
      yaxis : 'y1',
      type : 'scatter',
      mode : 'lines',
      name:'Curve'
    });
    traces.push({
      x: Array.from(bezcrv.cpoints.getA(':',0).data),
      y: Array.from(bezcrv.cpoints.getA(':',1).data),
      xaxis : 'x1',
      yaxis : 'y1',
      type : 'scatter',
      mode : 'markers',
      name:'Control Points'
    });
    return traces;
  }

  genBSplineCurveTess(bcrv:BSplineCurve) {
    return bcrv.tessellate(RESOLUTION);
  }

  genBSplinePlotTraces(bcrv:BSplineCurve) {
    let traces = [];
    let tess = bcrv.tessellate(RESOLUTION);

    traces.push({
      x: Array.from(tess.getA(':',0).data),
      y: Array.from(tess.getA(':',1).data),
      xaxis : 'x1',
      yaxis : 'y1',
      type : 'scatter',
      mode : 'lines',
      name:'Curve'
    });
    traces.push({
      x: Array.from(bcrv.cpoints.getA(':',0).data),
      y: Array.from(bcrv.cpoints.getA(':',1).data),
      xaxis : 'x1',
      yaxis : 'y1',
      type : 'scatter',
      mode : 'markers',
      name:'Control Points'
    });

    return traces;
  }

}