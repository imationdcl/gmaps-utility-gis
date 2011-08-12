dojo.provide("agsjs.layers.GoogleMapsLayer");
dojo.declare("agsjs.layers.GoogleMapsLayer", esri.layers.Layer, {constructor:function(a) {
  a = a || {};
  this.tileInfo = new esri.layers.TileInfo({rows:256, cols:256, dpi:96, origin:{x:-2.0037508342787E7, y:2.0037508342787E7}, spatialReference:{wkid:102100}, lods:[{level:1, resolution:78271.5169639999, scale:2.95828763795777E8}, {level:2, resolution:39135.7584820001, scale:1.47914381897889E8}, {level:3, resolution:19567.8792409999, scale:7.3957190948944E7}, {level:4, resolution:9783.93962049996, scale:3.6978595474472E7}, {level:5, resolution:4891.96981024998, scale:1.8489297737236E7}, {level:6, resolution:2445.98490512499, 
  scale:9244648.868618}, {level:7, resolution:1222.99245256249, scale:4622324.434309}, {level:8, resolution:611.49622628138, scale:2311162.217155}, {level:9, resolution:305.748113140558, scale:1155581.108577}, {level:10, resolution:152.874056570411, scale:577790.554289}, {level:11, resolution:76.4370282850732, scale:288895.277144}, {level:12, resolution:38.2185141425366, scale:144447.638572}, {level:13, resolution:19.1092570712683, scale:72223.819286}, {level:14, resolution:9.55462853563415, scale:36111.909643}, 
  {level:15, resolution:4.77731426794937, scale:18055.954822}, {level:16, resolution:2.38865713397468, scale:9027.977411}, {level:17, resolution:1.19432856685505, scale:4513.988705}, {level:18, resolution:0.597164283559817, scale:2256.994353}, {level:19, resolution:0.298582141647617, scale:1128.497176}]});
  this.opacity = a.opacity || 1;
  this._options = a;
  this._gmap = null;
  this.loaded = true
}, setMapTypeId:function(a) {
  if(this._gmap) {
    this._gmap.setMapTypeId(a)
  }else {
    this._options.mapTypeId = a
  }
}, getGMap:function() {
  return this._gmap
}, _setMap:function(a, b) {
  this._map = a;
  var c = document.createElement("div");
  if(this._options.id) {
    c.id = this.id
  }
  dojo.style(c, {position:"absolute", top:"0px", left:"0px", width:(a.width || b.offsetWidth) + "px", height:(a.height || b.offsetHeight) + "px"});
  b.appendChild(c);
  this._div = c;
  this._visibilityChangeHandle = dojo.connect(this, "onVisibilityChange", this, this._visibilityChangeHandler);
  this._opacityChangeHandle = dojo.connect(this, "onOpacityChange", this, this._onOpacityChangeHandler);
  (this.visible = this._options.visible === undefined ? true : this._options.visible) && this._initGMap();
  return c
}, _unsetMap:function(a, b) {
  b && b.removeChild(this._div);
  dojo.destroy(this._div);
  this._gmap = this._div = this._map = null;
  dojo.disconnect(this._extentChangeHandle);
  dojo.disconnect(this._panHandle);
  dojo.disconnect(this._resizeHandle);
  dojo.disconnect(this._visibilityChangeHandle);
  dojo.disconnect(this._opacityChangeHandle)
}, _initGMap:function() {
  if(window.google && google.maps) {
    var a = this._map.extent, b = this._options.center || this._esriPointToLatLng(a.getCenter()), c = this._map.getLevel() + 1;
    b = new google.maps.Map(this._div, {mapTypeId:this._options.mapTypeId || google.maps.MapTypeId.ROADMAP, disableDefaultUI:true, draggable:false, center:b, zoom:this._options.zoom || c > -1 ? c : 1});
    c < 1 && b.fitBounds(this._esriExtentToLatLngBounds(a));
    this._gmap = b;
    this._extentChangeHandle = dojo.connect(this._map, "onExtentChange", this, this._extentChangeHandler);
    this._panHandle = dojo.connect(this._map, "onPan", this, this._panHandler);
    this._resizeHandle = dojo.connect(this._map, "onResize", this, this._resizeHandler);
    this.onLoad(this)
  }else {
    if(agsjs.onGMapsApiLoad) {
      dojo.connect(agsjs, "onGMapsApiLoad", this, this._initGMap)
    }else {
      agsjs.onGMapsApiLoad = function() {
      };
      dojo.connect(agsjs, "onGMapsApiLoad", this, this._initGMap);
      a = document.createElement("script");
      a.type = "text/javascript";
      c = window.location.protocol + "//maps.google.com/maps/api/js?sensor=" + (this._options.sensor ? "true" : "false");
      if(this._options.client) {
        c += "&client=" + this._options.client
      }
      if(this._options.version) {
        c += "&v" + this._options.version
      }
      c += "&callback=agsjs.onGMapsApiLoad";
      a.src = c;
      document.getElementsByTagName("head").length > 0 ? document.getElementsByTagName("head")[0].appendChild(a) : document.body.appendChild(a)
    }
  }
}, _opacityChangeHandler:function(a) {
  this.setOpacity(a)
}, setOpacity:function(a) {
  if(this._div) {
    a = Math.min(Math.max(a, 0), 1);
    var b = this._div.style;
    if(typeof b.opacity !== "undefined") {
      b.opacity = a
    }else {
      if(typeof b.filters !== "undefined") {
        b.filters.alpha.opacity = Math.floor(100 * a)
      }else {
        if(typeof b.filter !== "undefined") {
          b.filter = "alpha(opacity:" + Math.floor(a * 100) + ")"
        }
      }
    }
  }
  this.opacity = a
}, _visibilityChangeHandler:function(a) {
  if(a) {
    esri.show(this._div);
    this.visible = true;
    if(this._gmap) {
      google.maps.event.trigger(this._gmap, "resize");
      this._setExtent(this._map.extent);
      this._panHandle = this._panHandle || dojo.connect(this._map, "onPan", this, "_panHandler");
      this._extentChangeHandle = this._extentChangeHandle || dojo.connect(this._map, "onExtentChange", this, "_extentChangeHandler")
    }else {
      this._initGMap()
    }
  }else {
    if(this._div) {
      esri.hide(this._div);
      this.visible = false;
      if(this._panHandle) {
        dojo.disconnect(this._panHandle);
        this._panHandle = null
      }
      if(this._extentChangeHandle) {
        dojo.disconnect(this._extentChangeHandle);
        this._extentChangeHandle = null
      }
    }
  }
}, _resizeHandler:function() {
  dojo.style(this._div, {width:this._map.width + "px", height:this._map.height + "px"});
  google.maps.event.trigger(this._gmap, "resize")
}, _extentChangeHandler:function(a, b, c) {
  c ? this._setExtent(a) : this._gmap.setCenter(this._esriPointToLatLng(a.getCenter()))
}, _panHandler:function(a) {
  this._gmap.setCenter(this._esriPointToLatLng(a.getCenter()))
}, _setExtent:function(a) {
  console.log("setextent");
  var b = this._map.getLevel() + 1;
  if(b >= 0) {
    a = this._esriPointToLatLng(a.getCenter());
    this._gmap.setZoom(b);
    this._gmap.setCenter(a)
  }else {
    this._gmap.fitBounds(this._esriExtentToLatLngBounds(a))
  }
}, _esriPointToLatLng:function(a) {
  a = esri.geometry.webMercatorToGeographic(a);
  return new google.maps.LatLng(a.y, a.x)
}, _esriExtentToLatLngBounds:function(a) {
  a = esri.geometry.webMercatorToGeographic(a);
  return new google.maps.LatLngBounds(new google.maps.LatLng(a.ymin, a.xmin, true), new google.maps.LatLng(a.ymax, a.xmax, true))
}});
