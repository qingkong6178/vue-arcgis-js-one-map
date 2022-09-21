import Graphic from "esri/Graphic"
import geometryEngine from "esri/geometry/geometryEngine"
import Point from "esri/geometry/Point"
function measureArea(view,draw,setMapTip) {
  // draw.complete()
  view.graphics.removeAll()
  document.documentElement.style.cursor = 'crosshair'
  enableCreatePolygon(draw, view, setMapTip)
}
function enableCreatePolygon(draw, view, setMapTip) {
  let action = draw.create("polygon")
  view.focus()
  action.on("vertex-add", (evt) => {drawPolygon(evt,view)})
  action.on("cursor-update", (evt) => {drawPolygon(evt,view)})
  action.on("vertex-remove", (evt) => {drawPolygon(evt,view)})
  action.on("draw-complete", (evt) => {drawPolygon(evt,view,setMapTip)})
}
function drawPolygon(event,view,setMapTip) {
  let vertices = event.vertices;
  view.graphics.removeAll();
  let graphic = createPolygonByVertices(vertices,view.spatialReference);
  view.graphics.add(graphic);
  let areaValue;
  let area
  let label
  let polygon=graphic.geometry;
  if (vertices.length > 2) {
    if(view.spatialReference.wkid == 4326||view.spatialReference.isWebMercator||view.spatialReference.isGeographic){//经纬度算法
      areaValue = Math.abs(geometryEngine.geodesicArea(polygon, "square-meters"))
    }else {//投影平面算法
      areaValue = Math.abs(geometryEngine.planarArea(polygon, "square-meters"))
    }
  }
  if(areaValue > 0){
    area = getAreaString(areaValue)
    label = labelAreas(polygon.centroid,area)
    view.graphics.add(label)
  }
  if(event.type == "draw-complete"){
    document.documentElement.style.cursor = '';
    setMapTip(false)
  }
}
function createPolygonByVertices(vertices,spatialReference){
  let polygon = {
    type: "polygon",
    rings: vertices
  }
  if(spatialReference.isGeographic && spatialReference.wkid!=4326 && !spatialReference.isWebMercator){
    polygon.spatialReference = {
        wkid:4326
    }
  }else{
    polygon.spatialReference = spatialReference
  }

  let graphic = new Graphic({
    geometry: polygon,
    symbol: {
      type: "simple-fill",
      color: [255,48,48,0.3],
      style: "solid",
      outline: {
        color: [255,64,64,0.5],
        width: 2
      }
    }
  });
  return graphic
}
function getAreaString(area) {
  return area < 1000000 ? area.toFixed(2) + "平方米" : (area / 1000000).toFixed(2) + "平方公里";
}
function labelAreas(pt,area){
  let graphic = new Graphic({
    geometry: pt,
    symbol: {
      type: "text",
      color: "white",
      haloColor: "black",
      haloSize: "1px",
      text: area,
      font: {
        size: 14,
      }
    }
  })
  return graphic
}

function measureDist(view,draw,setMapTip) {
  // draw.complete()
  view.graphics.removeAll()
  document.documentElement.style.cursor = 'crosshair'
  enableCreatePolyline(draw, view,setMapTip)
}
function enableCreatePolyline(draw, view, setMapTip) {
  let action = draw.create("polyline")
  view.focus()
  action.on("vertex-add", (evt) => {drawLine(evt,view)})
  action.on("cursor-update", (evt) => {drawLine(evt,view)})
  action.on("draw-complete", (evt) => {drawLine(evt,view,setMapTip)})
  action.on("vertex-remove", (evt) => {drawLine(evt,view)})
}
function drawLine(event,view,setMapTip) {
  let show_point;
  let vertices = event.vertices;
  view.graphics.removeAll();
  let graphic = createPolylineByVertices(vertices,view.spatialReference);
  view.graphics.add(graphic);

  if (vertices.length >= 2) {
    let _totalDist = 0;
    show_point = new Point({
      x: vertices[0][0],
      y: vertices[0][1],
      spatialReference: view.spatialReference
    })
    let node = labelNode(show_point)
    view.graphics.add(node)
    for (let i = 1; i < vertices.length; i++) {
      let label;
      show_point = new Point({
        x: vertices[i][0],
        y: vertices[i][1],
        spatialReference: view.spatialReference
      })
      let everyGraphic = createPolylineByVertices([vertices[i],vertices[i-1]],view.spatialReference);
      view.graphics.add(everyGraphic);
      if(view.spatialReference.wkid==4326||view.spatialReference.isWebMercator||view.spatialReference.isGeographic){//经纬度算法
        _totalDist =_totalDist + geometryEngine.geodesicLength(everyGraphic.geometry, "meters");
      }else{//投影平面算法
        _totalDist = _totalDist + geometryEngine.planarLength(everyGraphic.geometry, "meters");
      }
      let distance = getDistanceString (_totalDist);
      label = labelDistance(show_point,distance);
      let node = labelNode(show_point)
      view.graphics.add(label)
      view.graphics.add(node)
    }
  }
  if (event.type == "draw-complete") {
    document.documentElement.style.cursor = '';
    setMapTip(false)
  }
}
function createPolylineByVertices(vertices,spatialReference){
  let polyline = {
    type: "polyline",
    paths: [vertices],
  }
  if(spatialReference.isGeographic && spatialReference.wkid!=4326 && !spatialReference.isWebMercator){
    polyline.spatialReference = {
      wkid:4326
    }
  }else{
    polyline.spatialReference = spatialReference
  }

  let graphic = new Graphic({
    geometry: polyline,
    symbol: {
      type: "simple-line",
      color: [255,48,48,0.3],
      style: "solid",
      width: 2
    }
  })
  return graphic
}
function getDistanceString(distance) {
  return distance < 1000 ? distance.toFixed(2) + "米" : (distance / 1000).toFixed(2) + "公里";
}
function labelDistance(pt,distance){
  let graphic = new Graphic({
    geometry: pt,
    symbol: {
      type: "text",
      color: "white",
      haloColor: "black",
      haloSize: "1px",
      text: distance,
      font: {
        size: 14,
      }
    }
  })
  return graphic
}
function labelNode(pt){
  let graphic = new Graphic({
    geometry: pt,
    symbol: {
      type: "simple-marker",
      color: [255,48,48,0.3],
      size: "8px",
      outline: {
        color: [255,64,64,0.5],
        width: 2
      }
    }
  })
  return graphic
}

export default {
  measureDist,
  measureArea
}
