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

import $ = require("jquery");
require('select2');

import {DATA} from './pgdata'

let DATA_MAP:any = {};

import {GeometryAdapter, ActionAdapter} from './adapter'

function nameToKey(name:string) {
  return name.replace(/[\(\)\s]+/g,'-').toLowerCase();
}

$(document).ready(function () {

  let plotDiv = document.createElement('div');
  document.body.appendChild(plotDiv);
  plotDiv.style.width = '600px';
  plotDiv.style.height = '600px';

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

  let anchorPattern = /#([\d\w-]+)$/;
  let getParamPattern = /\?(\w+)=(.*)$/;

  let curChoice = null;
  if(anchorPattern.test(window.location.href)) {
    let urlmatch = anchorPattern.exec(window.location.href);
    curChoice = urlmatch![1];
    $('#pg-selector').val(''+curChoice);
    $('#pg-selector').trigger('change');
  } else if(getParamPattern.test(window.location.href)) {
    let key = getParamPattern.exec(window.location.href)![1];
    let value = getParamPattern.exec(window.location.href)![2];
    if(key === 'json') {
      let data = JSON.parse(atob(value));
      loadData(data,plotDiv);
      $(".select2").remove();
    }
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
      loadData(data,plotDiv);
    }
  }
});

function loadData(data:any, plotDiv:HTMLElement) {
  if(data.type === 'Action') {
    plotDiv.style.height = '800px';
    new ActionAdapter(plotDiv, data, DATA_MAP, nameToKey);
  } else {
    plotDiv.style.height = '500px';
    new GeometryAdapter(plotDiv, data, DATA_MAP, nameToKey);
  }
}
