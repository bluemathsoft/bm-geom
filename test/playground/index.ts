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

import $ = require("jquery");
require('select2');

import {DATA} from './pgdata'

/*
function doPlot(plotDiv:HTMLElement,width=600,height=600) {
  let layout:any = {
    showlegend : false
  };
  let RANGE = [0,25];
  let margin = 0.0;

  if(width < height) { // Portrait - Vertical stack
    layout.yaxis = { range:RANGE, domain:[0,0.5-margin] };
    layout.yaxis2 = { range:RANGE, domain:[0.5+margin,1] };
  } else { // Landscape - Horizontal stack
    layout.xaxis = { range:RANGE, domain:[0,0.5-margin] };
    layout.xaxis2 = { range:RANGE, domain:[0.5+margin,1] };
    layout.yaxis2 = { range:RANGE, anchor : 'x2' };
  }
  layout.margin = {
    t:0,
    b:0,
    l:0,
    r:0
  }
  plotDiv.style.width = width+'px';
  plotDiv.style.height = height+'px';

	Plotly.newPlot(plotDiv, [
      {
        x: [1, 2, 3, 4, 5],
        y: [1, 2, 4, 3, 16],
        xaxis : 'x1',
        yaxis : 'y1'
      },
      {
        x: [1, 2, 3, 4, 5],
        y: [1, 20, 4, 8, 16],
        xaxis : 'x2',
        yaxis : 'y2'
      }
    ], layout
  );

}
*/

import {GeometryAdapter, ActionAdapter} from './adapter'

function nameToKey(name:string) {
  return name.replace(/[\(\)\s]+/g,'-').toLowerCase();
}

$(document).ready(function () {

  let plotDiv = document.createElement('div');
  document.body.appendChild(plotDiv);
  plotDiv.style.width = '600px';
  plotDiv.style.height = '600px';
    


  let urlmatch = /#([\d\w-]+)$/.exec(window.location.href);

  let DATA_MAP:any = {};
  for(let i=0; i<DATA.length; i++) {
    let entry = DATA[i];
    for(let node of entry.objects) {
      let key = nameToKey(node.name);
      $('#geom-selection').append(
        $('<option></option>').val(key).html(node.name));
      DATA_MAP[key] = node;
    }
  }

  let selectData:any[] = DATA.map(group => {
    return {
      text : group.groupname,
      children : (<any[]>group.objects).map(object => {
        return {
          id : nameToKey(object.name),
          text : object.name
        };
      })
    };
  });
  selectData.unshift({id:'0',text:'Select',disabled:true,selected:true});

  $('#pg-selector').select2({
    data : selectData,
    width : '50%'
  });

  let curChoice = null;
  if(urlmatch) {
    curChoice = urlmatch[1];
    $('#pg-selector').val(''+curChoice);
    $('#pg-selector').trigger('change');
  } else {
    curChoice = $('#pg-selector:selected').val();
  }

  $('#pg-selector').on('change',function() {
    let choice = $('#pg-selector').val();
    window.location.href =
      window.location.protocol + '//' +
      window.location.host + window.location.pathname + '#' + choice;
    window.location.reload(true);
  });

  if(typeof curChoice === 'string') {
    let data = DATA_MAP[curChoice];
    if(data) {
      if(data.type === 'Action') {
        plotDiv.style.height = '800px';
        new ActionAdapter(plotDiv, data, DATA_MAP, nameToKey);
      } else {
        plotDiv.style.height = '500px';
        new GeometryAdapter(plotDiv, data, DATA_MAP, nameToKey);
      }
    }
  }

  /*
  doPlot(plotDiv,window.innerWidth-50, window.innerHeight-50);

  $(window).resize(function () {
    doPlot(plotDiv,window.innerWidth-50, window.innerHeight-50);
  });
  */
});
