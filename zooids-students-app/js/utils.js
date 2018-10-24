/*
 Author: Charles Perin
 2015, May 29
 */


/*----------------------------D3 extension----------------------------*/
//noinspection JSPotentiallyInvalidConstructorUsage
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//from http://stackoverflow.com/questions/13040685/finding-offset-position-of-svg-element
d3.selection.prototype.position = function() {

  var el = this.node();
  var elPos = el.getBoundingClientRect();
  var vpPos = getVpPos(el);

  function getVpPos(el) {
    if(el.parentElement.tagName === 'svg') {
      return el.parentElement.getBoundingClientRect();
    }
    return getVpPos(el.parentElement);
  }

  var obj = {
    top: elPos.top - vpPos.top,
    left: elPos.left - vpPos.left,
    width: elPos.width,
    bottom: elPos.bottom - vpPos.top,
    height: elPos.height,
    right: elPos.right - vpPos.left
  };
  obj.cx = obj.left + obj.width/2;
  obj.cy = obj.top + obj.height/2;
  return obj;

};

d3.translate = function(x,y){
  return "translate("+[x,y]+")";
};

d3.selection.prototype.dblTap = function(callback) {
  var last = 0;
  return this.each(function() {
    d3.select(this).on("touchstart", function(e) {
      if ((d3.event.timeStamp - last) < 500) {
        return callback(e);
      }
      last = d3.event.timeStamp;
    });
  });
};

d3.stringBox = function(svg, string, font, aclass) {
  var f = font || '12px arial';

  var text = svg.append("svg:text")
      .attr("class","tmpText "+aclass)
      .attr("x", -1000)
      .attr("y", -1000)
      .style("font", f)
      .style("opacity", 0)
      .text(string);

  var w = text.node().getBBox().width,
      h = text.node().getBBox().height;

  d3.selectAll(".tmpText").remove();
  return {width: w, height: h};
};

String.prototype.capitalizeFirst = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};




debug = {
  printMess: function(level,_array){
    if(level) console.log(_array)
  },
  printErr: function(level,_array){
    if(level) throw new Error(_array.join())
  }
};


//noinspection JSUnusedGlobalSymbols
var Utils = {

  getParameterByName: function(name,url){
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  mergeOptions: function(destination, source) {
    var returnObj = {}, attrname;
    for (attrname in destination) { returnObj[attrname] = destination[attrname]; }
    for (attrname in source) { returnObj[attrname] = source[attrname]; }
    return returnObj;
  },

  getShapeCoords: function(type, size){
    switch(type){
      case "check":
        var r = Math.sqrt(size) / 2;
        return [{x: -r, y: 0}, {x: 0, y: r}, {x: r, y: -r}];
        break;
      case "cross":
        var r = Math.sqrt(size / 5) / 2;
        return [{x: -3*r, y: -r}, {x: -r, y: -r}, {x: -r, y: -3*r}, {x: r, y: -3*r}, {x: r, y: -r}, {x: 3*r, y: -r}, {x: 3*r, y: r}, {x: r, y: r}, {x: r, y: 3*r}, {x: -r, y: 3*r}, {x: -r, y: r}, {x: -3*r, y: r}, {x: -3*r, y: -r}];
      //"M" + -3 * r + "," + -r +  "H" + -r +       "V" + -3 * r +      "H" + r       "V" + -r +     "H" + 3 * r +     "V" + r +      "H" + r +     "V" + 3 * r   +  "H" + -r +       "V" + r     + "H" + -3 * r   + "Z";
      case "diamond":
        var ry = Math.sqrt(size / (2 * Math.tan(30 * Math.PI / 180))), rx = ry * Math.tan(30 * Math.PI / 180);
        return [{x: 0, y: -ry}, {x: rx, y: 0}, {x: 0, y: ry},     {x: -rx, y: 0},     {x: 0, y: -ry}];
      //return "M0," + -ry +   "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" +           "Z";
      case "square":
        var r = Math.sqrt(size) / 2;
        return  [{x: -r, y: -r},           {x: r, y: -r},      {x: r, y: r},       {x: -r, y: r},      {x: -r, y: -r}];
      //return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r +          "Z";
      case "triangleDown":
        var rx = Math.sqrt(size / Math.sqrt(3)), ry = rx * Math.sqrt(3) / 2;
        return [{x: 0, y: ry},   {x: rx, y: -ry},          {x: -rx, y: -ry},        {x: 0, y: ry}];
      //return "M0," + ry +   "L" + rx + "," + -ry + " " + -rx + "," + -ry +             "Z";
      case "triangleUp":
        var rx = Math.sqrt(size / Math.sqrt(3)), ry = rx * Math.sqrt(3) / 2;
        return [{x: 0, y: -ry}, {x: rx, y: ry},           {x: -rx, y: ry},    {x: 0, y: -ry}];
      //return "M0," + -ry +   "L" + rx + "," + ry + " " + -rx + "," + ry +        "Z";
      default: console.error("unknown type",type);
    }
  },

  getShapePath: function(type, size){
    switch(type){
      case "cross":
        var r = Math.sqrt(size / 5) / 2;
        return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
      case "diamond":
        var ry = Math.sqrt(size / (2 * Math.tan(30 * Math.PI / 180))), rx = ry * Math.tan(30 * Math.PI / 180);
        return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
      case "square":
        var r = Math.sqrt(size) / 2;
        return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
      case "triangleDown":
        var rx = Math.sqrt(size / Math.sqrt(3)), ry = rx * Math.sqrt(3) / 2;
        return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
      case "triangleUp":
        var rx = Math.sqrt(size / Math.sqrt(3)), ry = rx * Math.sqrt(3) / 2;
        return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
      default: console.error("unknown type",type);
    }
  },

  getRandomInInterval: function (array) {
    return Math.random() * (array[1] - array[0]) + array[0];
  },

  rotateAxisLabels: function(svg, anchor, angle,dx,dy){
    svg.selectAll("text")
        .style("text-anchor",anchor)
        .attr({
          dx: dx,
          dy: dy,
          transform: "rotate("+angle+")"
        });
  },

  getClientDim: function(){
    return {
      width: (window.innerWidth || document.body.clientWidth ),
      height: (window.innerHeight || document.body.clientHeight )
    }
  },
  /*
   returns the x and y translate for a rotation of angle
   */
  getXYRotate: function(x, y, angle){
    return [
      x * Math.cos(angle) - y * Math.sin(angle),
      x * Math.sin(angle) + y * Math.cos(angle)
    ]
  },

  /*
   Clone a node identified by the selected_node in the container and gives it the cloneClass
   */
  clone : function(selected_node, container, cloneClass) {
    container = container.node();
    var node = selected_node.node();
    return d3.select(container.insertBefore(node.cloneNode(true), node.nextSibling)).classed(cloneClass,true);
  },

  catchEvent: function(){
    if(d3.event)d3.event.stopPropagation();
  },

  open_in_new_tab: function(url){
    var win=window.open(url, '_blank');
    win.focus();
  },

  cloneObj: function(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;
    // Handle Date
    var copy = undefined;
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }
    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.cloneObj(obj[i]);
      }
      return copy;
    }
    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = Utils.cloneObj(obj[attr]);
      }
      return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
  },
  getFalseArray: function(array){
    var res = [];
    for(var i in array){
      //noinspection JSUnfilteredForInLoop
      res[i] = false;
    }
    return res;
  },

  checkTrueArray: function(array){
    var ok = true;
    for(var i in array){
      //noinspection JSUnfilteredForInLoop
      if(array[i] == false){
        ok = false;
        break;
      }
    }
    return ok;
  },

  toDegrees: function(radians) {
    return radians / Math.PI * 180;
  },

  removeNullValues: function(_array){
    for (var i = 0; i < _array.length; i++) {
      if (_array[i] == null) {
        _array.splice(i, 1);
        i--;
      }
    }
    return _array;
  },

  removeDuplicateValues: function(_array){
    _array = _array.filter(function(elem, pos) {
      return _array.indexOf(elem) == pos;
    });
    return _array;
  },

  distance: function(o1, o2){
    return Math.sqrt((o1.x-o2.x)*((o1.x-o2.x))+(o1.y-o2.y)*((o1.y-o2.y)));
  },

  getAngle: function(o1,o2,type){
    var radians;
    if(o2.x - o1.x == 0){
      if(o2.y - o1.y > 0) radians = Math.PI / 2;
      else radians = - Math.PI / 2;
    }
    //else radians = Math.atan((o2.y - o1.y)/(o2.x - o1.x));
    else radians = Math.atan2((o2.y - o1.y),(o2.x - o1.x));
    radians = - radians;
    if(type == "degrees") return Utils.toDegrees(radians);
    else return radians;
  },

  XYDiff: function(o1, o2){
    return {x: Math.abs(o1.x-o2.x), y: Math.abs(o1.y-o2.y)};
  },

  export_png: function() {
    canvg(document.getElementById('canvas-export'), d3.select("#scatterplot").node().innerHTML, {scaleWidth : 500, scaleHeight: 500, renderCallback: shiftSelections, ignoreDimensions: true, ignoreAnimation: true, ignoreMouse: true});
    var canvas = document.getElementById("canvas-export");
    var img    = canvas.toDataURL("image/png");
    window.location = canvas.toDataURL("image/png");
  },

  truncate: function(string, size){
    if (string.length > size)
      return string.substring(0,size)+'...';
    else
      return string;
  },

  truncateK: function(string){

    if (string > 1000) {
      string = string+"";
      return string.substring(0,string.length-3)+'K';
    }
    else
      return string+"";
  },

  urlencode: function(s) {
    s = encodeURIComponent(s);
    s = s.replace(/~/g,'%7E').replace(/%20/g,'+').replace(/:/g,'%3A').replace(/'/g,'%27').replace(/!/g, '%21');
    return s.replace(/%/g, '%25');
  },

  isNumber: function(o) {
    if(!/^[\d|\.|\-]+$/.test(o)) return false;
    return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
  },

  isArrayString: function(o){
    if(o.indexOf("[") == 0 && o.indexOf("]") == o.length-1){
      var values = o.substring(1, o.length-1).split(";");
      for(var val in values){
        if(!Utils.isNumber(val)) return false;
      }
      return true;
    }
    return false;
  },

  getCIText : function(cell){
    return cell.value + " [" + cell.ci_min + ";" + cell.ci_max + "]";
  },

  getNumber: function(o){
    if(!/^[\d|\.]+$/.test(o)) return null;
    var number = parseFloat(o);
    if(!isNaN(number) && this.isNumber(number)) return number;
    else return null;
  },

  getArray: function(o){
    if(o.indexOf("[") == 0 && o.indexOf("]") == o.length-1){
      var values = o.substring(1, o.length-1).split(";");
      values = values.map(function(val){
        var number = Utils.getNumber(val);
        if(number != null) return number;
        else if(val == null || val == undefined) return "";
      });
      return values.sort(function(a,b){return d3.ascending(a,b)});
    }
    return null;
  },

  isBooleanString: function(s){
    if(!s instanceof String) return false;
    s = s.toLowerCase();
    return s == "1" || s == "0" || s == "true" || s == "false" || s == "vrai" || s == "faux" || s == "yes" || s == "no" || s == "oui" || s == "non";
  },

  getBooleanValue: function(s){
    if(s==1 || s==0) return s;
    s = s.toLowerCase();
    if(s=="1" || s == "true" || s == "vrai" || s == "yes" || s == "oui") return 1;
    return 0;
  },

  getCurrentTimeMillis: function(){
    return new Date().getTime();
  },

  getCurrentTimeSeconds: function(){
    return new Date().getTime() / 1000;
  },

  getRandomString: function(size){
    var text = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < size; i++ )
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    return text;
  },

  loadImage: function(url){
    var img = new Image();
    img.src=url;
    return img;
  },

  vectorsSum: function(v1,v2){
    if(v1.length != v2.length) console.error("v1 and v2 have different length",v1,v2);
    var res = [];
    for(var v in v1){
      res[v] = v1[v] + v2[v];
    }
    return res;
  },

  getURLParameter: function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
  },

  getTransform: function(e){
    return d3.transform(e.attr("transform"));
  },

  //get the center of the d3 selection
  getShapeCenter: function(o){
    var bbox = o.node().getBBox();
    return {x: bbox.x+bbox.width/2, y: bbox.y+bbox.height/2};
  },

  //m0 is a SVG transform matrix
  getTransformMatrix: function(m0){
    var matrix = new Matrix();//need transform-matrix library
    var t = ["a","b","c","d","e","f"];
    for(var i in t){
      var key = t[i];
      matrix[key] = m0[key];
    }
    return matrix;
  },

  //with o a d3 selection
  getSVGTransformMatrix: function(o){
    return o.node().getCTM();
  },

  find_y_given_x: function(x, path, rightToLeft) {
    var pathEl = path.node();
    var pathLength = pathEl.getTotalLength();
    var beginning = 0, end = pathLength, target;

    while (true) {
      target = Math.floor((beginning + end) / 2);
      var pos = pathEl.getPointAtLength(target);
      if ((target === end || target === beginning) && pos.x !== x) {
        break;
      }
      if(rightToLeft){
        if (pos.x < x)      end = target;
        else if (pos.x > x) beginning = target;
        else                break; //position found
      }
      else {
        if (pos.x > x)      end = target;
        else if (pos.x < x) beginning = target;
        else                break; //position found
      }
    }
    return pos.y;
  },

  find_path_segment_and_point_given_x: function(x,path){
    var pathEl = path.node();
    var pathLength = pathEl.getTotalLength();
    var BBox = pathEl.getBBox();
    var scale = pathLength/BBox.width;
    var offsetLeft = document.getElementById("line").offsetLeft;
    var offsetTop = document.getElementById("line").offsetTop;

    var beginning = x, end = pathLength, target;

    while (true) {
      target = Math.floor((beginning + end) / 2);
      pos = pathEl.getPointAtLength(target);
      if ((target === end || target === beginning) && pos.x !== x) {
        break;
      }
      if (pos.x > x)      end = target;
      else if (pos.x < x) beginning = target;
      else                break; //position found
    }
    return {point: pos, segment: path.node().pathSegList.getItem(path.node().getPathSegAtLength(target))};
  },

  find_hash: function(str) {
    return location.hash.substr(location.hash.indexOf(str+'=')).split('&')[0].split('=')[1]
  },

  randomFromInterval: function(from,to){
    return Math.floor(Math.random()*(to-from+1)+from);
  },

  get_mouse_direction: function(event) {
    // http://stackoverflow.com/questions/9047600/how-to-determine-the-direction-on-onmousemove-event
    //check to make sure there is data to compare against
    if (typeof(last_mouse_position.x) != 'undefined') {

      //get the change from last position to this position
      var deltaX = last_mouse_position.x - event.clientX,
          deltaY = last_mouse_position.y - event.clientY;

      //check which direction had the highest amplitude and then figure out direction by checking if the value is greater or less than zero
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
        return "LEFT";
      } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0) {
        return "RIGHT";
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
        return "TOP";
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < 0) {
        return "DOWN";
      } else
        return "ERROR";
    }

    //set the new last position to the current for next time
    last_mouse_position = {
      x : event.clientX,
      y : event.clientY
    };
  },

  //from http://stackoverflow.com/questions/13046811/how-to-determine-size-of-raphael-object-after-scaling-rotating-it/13111598#13111598
  //e1 is a SVG node
  getMetrics: function(el){
    function pointToLineDist(A, B, P) {
      var nL = Math.sqrt((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y));
      return Math.abs((P.x - A.x) * (B.y - A.y) - (P.y - A.y) * (B.x - A.x)) / nL;
    }

    function dist(point1, point2) {
      var xs = 0,
          ys = 0;
      xs = point2.x - point1.x;
      xs = xs * xs;
      ys = point2.y - point1.y;
      ys = ys * ys;
      return Math.sqrt(xs + ys);
    }
    var b = el.getBBox(),
        objDOM = el,
        svgDOM = objDOM.ownerSVGElement;
    // Get the local to global matrix
    var matrix = svgDOM.getTransformToElement(objDOM).inverse(),
        oldp = [[b.x, b.y], [b.x + b.width, b.y], [b.x + b.width, b.y + b.height], [b.x, b.y + b.height]],
        pt, newp = [],
        obj = {},
        i, pos = Number.POSITIVE_INFINITY,
        neg = Number.NEGATIVE_INFINITY,
        minX = pos,
        minY = pos,
        maxX = neg,
        maxY = neg;

    for (i = 0; i < 4; i++) {
      pt = svgDOM.createSVGPoint();
      pt.x = oldp[i][0];
      pt.y = oldp[i][1];
      newp[i] = pt.matrixTransform(matrix);
      if (newp[i].x < minX) minX = newp[i].x;
      if (newp[i].y < minY) minY = newp[i].y;
      if (newp[i].x > maxX) maxX = newp[i].x;
      if (newp[i].y > maxY) maxY = newp[i].y;
    }
    // The next refers to the transformed object itself, not bbox
    // newp[0] - newp[3] are the transformed object's corner
    // points in clockwise order starting from top left corner
    obj.newp = newp; // array of corner points
    obj.width = pointToLineDist(newp[1], newp[2], newp[0]) || 0;
    obj.height = pointToLineDist(newp[2], newp[3], newp[0]) || 0;
    obj.toplen = dist(newp[0], newp[1]);
    obj.rightlen = dist(newp[1], newp[2]);
    obj.bottomlen = dist(newp[2], newp[3]);
    obj.leftlen = dist(newp[3], newp[0]);
    // The next refers to the transformed object's bounding box
    obj.BBx = minX;
    obj.BBy = minY;
    obj.BBx2 = maxX;
    obj.BBy2 = maxY;
    obj.BBwidth = maxX - minX;
    obj.BBheight = maxY - minY;
    return obj;
  },

  //return an array of arrays, each array being a permutation of the values
  getPermutations: function(inputArr) {
    var results = [];

    function permute(arr, memo) {
      var cur, memo = memo || [];

      for (var i = 0; i < arr.length; i++) {
        cur = arr.splice(i, 1);
        if (arr.length === 0) {
          results.push(memo.concat(cur));
        }
        permute(arr.slice(), memo.concat(cur));
        arr.splice(i, 0, cur[0]);
      }

      return results;
    }

    return permute(inputArr);
  },

  get_time_diff: function( time1, time2 ){
    var time1 = new Date( time1 ).getTime();
    var time2 = new Date( time2 ).getTime();

    if( isNaN(time1) || isNaN(time2) ) {
      return "";
    }

    if (time1 < time2) {
      var milisec_diff = time2 - time1;
    }else{
      var milisec_diff = time1 - time2;
    }

    return milisec_diff;

  },

  millisToDHMS: function(millis){
    var days = Math.floor(millis / (1000 * 60 * 60 * 24));
    var hours = Math.floor((millis / (1000 * 60 * 60)) % 24);
    var minutes = Math.floor((millis / (1000 * 60)) % 60);

    var date_diff = new Date( millis );

    return days + " Days "+ hours + " Hours " + minutes + " Minutes ";
  }
};





Latinise={};
Latinise.latin_map={"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"};
String.prototype.latinise=function(){return this.replace(/[^A-Za-z0-9\[\] ]/g,function(a){return Latinise.latin_map[a]||a})};
//noinspection JSUnusedGlobalSymbols
String.prototype.latinize=String.prototype.latinise;
//noinspection JSUnusedGlobalSymbols
String.prototype.isLatin=function(){return this==this.latinise()};




//---------------window scrolling-----------------//
// Page Size and View Port Dimension Tools
// http://stevenbenner.com/2010/04/calculate-page-size-and-view-port-position-in-javascript/
if (!sb_windowTools) { var sb_windowTools = new Object(); }

sb_windowTools = {
  scrollBarPadding: 17, // padding to assume for scroll bars

  // EXAMPLE METHODS

  // center an element in the viewport
  centerElementOnScreen: function(element) {
    var pageDimensions = this.updateDimensions();
    element.style.top = ((this.pageDimensions.verticalOffset() + this.pageDimensions.windowHeight() / 2) - (this.scrollBarPadding + element.offsetHeight / 2)) + 'px';
    element.style.left = ((this.pageDimensions.windowWidth() / 2) - (this.scrollBarPadding + element.offsetWidth / 2)) + 'px';
    element.style.position = 'absolute';
  },

  // INFORMATION GETTERS

  // load the page size, view port position and vertical scroll offset
  updateDimensions: function() {
    this.updatePageSize();
    this.updateWindowSize();
    this.updateScrollOffset();
  },

  // load page size information
  updatePageSize: function() {
    // document dimensions
    var viewportWidth, viewportHeight;
    if (window.innerHeight && window.scrollMaxY) {
      viewportWidth = document.body.scrollWidth;
      viewportHeight = window.innerHeight + window.scrollMaxY;
    } else if (document.body.scrollHeight > document.body.offsetHeight) {
      // all but explorer mac
      viewportWidth = document.body.scrollWidth;
      viewportHeight = document.body.scrollHeight;
    } else {
      // explorer mac...would also work in explorer 6 strict, mozilla and safari
      viewportWidth = document.body.offsetWidth;
      viewportHeight = document.body.offsetHeight;
    }
    this.pageSize = {
      viewportWidth: viewportWidth,
      viewportHeight: viewportHeight
    };
  },

  // load window size information
  updateWindowSize: function() {
    // view port dimensions
    var windowWidth, windowHeight;
    if (self.innerHeight) {
      // all except explorer
      windowWidth = self.innerWidth;
      windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
      // explorer 6 strict mode
      windowWidth = document.documentElement.clientWidth;
      windowHeight = document.documentElement.clientHeight;
    } else if (document.body) {
      // other explorers
      windowWidth = document.body.clientWidth;
      windowHeight = document.body.clientHeight;
    }
    this.windowSize = {
      windowWidth: windowWidth,
      windowHeight: windowHeight
    };
  },

  // load scroll offset information
  updateScrollOffset: function() {
    // viewport vertical scroll offset
    var horizontalOffset, verticalOffset;
    if (self.pageYOffset) {
      horizontalOffset = self.pageXOffset;
      verticalOffset = self.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {
      // Explorer 6 Strict
      horizontalOffset = document.documentElement.scrollLeft;
      verticalOffset = document.documentElement.scrollTop;
    } else if (document.body) {
      // all other Explorers
      horizontalOffset = document.body.scrollLeft;
      verticalOffset = document.body.scrollTop;
    }
    this.scrollOffset = {
      horizontalOffset: horizontalOffset,
      verticalOffset: verticalOffset
    };
  },

  // INFORMATION CONTAINERS

  // raw data containers
  pageSize: {},
  windowSize: {},
  scrollOffset: {},

  // combined dimensions object with bounding logic
  pageDimensions: {
    pageWidth: function() {
      return sb_windowTools.pageSize.viewportWidth > sb_windowTools.windowSize.windowWidth ?
          sb_windowTools.pageSize.viewportWidth :
          sb_windowTools.windowSize.windowWidth;
    },
    pageHeight: function() {
      return sb_windowTools.pageSize.viewportHeight > sb_windowTools.windowSize.windowHeight ?
          sb_windowTools.pageSize.viewportHeight :
          sb_windowTools.windowSize.windowHeight;
    },
    windowWidth: function() {
      return sb_windowTools.windowSize.windowWidth;
    },
    windowHeight: function() {
      return sb_windowTools.windowSize.windowHeight;
    },
    horizontalOffset: function() {
      return sb_windowTools.scrollOffset.horizontalOffset;
    },
    verticalOffset: function() {
      return sb_windowTools.scrollOffset.verticalOffset;
    }
  }
};
