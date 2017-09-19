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

import {BezierCurve} from '../../src/nurbs'
import {arr} from '@bluemath/common'
import {Renderer} from './renderer'

export class GeometryAdapter {

  rndr : Renderer;

  constructor(rndr : Renderer) {
    this.rndr = rndr;
  }

  render(data) {
    switch(data.type) {
    case 'BezierCurve':
      this.renderBezier(data.object);
      break;
    }
  }

  renderBezier(data) {
    let bezcrv = new BezierCurve(
      data.degree,
      arr(data.cpoints),
      data.weights?arr(data.weights):undefined);

    let traces = [];  
    let tess = bezcrv.tessellateAdaptive(0.01);

    if(bezcrv.dimension === 2) {
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
    } else if(bezcrv.dimension === 3) {
      traces.push({
        x: Array.from(tess.getA(':',0).data),
        y: Array.from(tess.getA(':',1).data),
        z: Array.from(tess.getA(':',2).data),
        type : 'scatter3d',
        mode : 'lines',
        name:'Curve'
      });
      traces.push({
        x: Array.from(bezcrv.cpoints.getA(':',0).data),
        y: Array.from(bezcrv.cpoints.getA(':',1).data),
        z: Array.from(bezcrv.cpoints.getA(':',2).data),
        type : 'scatter3d',
        mode : 'markers',
        name:'Control Points'
      });
    }
    this.rndr.render2D(traces);
  }
}