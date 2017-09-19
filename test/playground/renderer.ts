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

import * as Plotly from 'plotly.js/lib/core'

export class Renderer {

  div2D : HTMLElement;
  div3D : HTMLElement;

  constructor(div2D:HTMLElement,div3D:HTMLElement) {
    this.div2D = div2D;
    this.div3D = div3D;

    this.init2D();
  }

  private init2D() {

    let layout:any = {
      showlegend : false
    };
    let RANGE = [0,25];
    let margin = 0.0;

    /*
    if(width < height) { // Portrait - Vertical stack
      layout.yaxis = { range:RANGE, domain:[0,0.5-margin] };
      layout.yaxis2 = { range:RANGE, domain:[0.5+margin,1] };
    } else { // Landscape - Horizontal stack
      layout.xaxis = { range:RANGE, domain:[0,0.5-margin] };
      layout.xaxis2 = { range:RANGE, domain:[0.5+margin,1] };
      layout.yaxis2 = { range:RANGE, anchor : 'x2' };
    }
    */
    layout.margin = {
      t:0,
      b:0,
      l:0,
      r:0
    }
    //plotDiv.style.width = width+'px';
    //plotDiv.style.height = height+'px';

  }

  render2D(traces) {
    Plotly.newPlot(this.div2D, traces, {});
  }

  render3D() {

  }
}