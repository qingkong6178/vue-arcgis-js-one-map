/*平面的长度测量，面积测量*/
import DistanceMeasurement2D from "esri/widgets/DistanceMeasurement2D";
import AreaMeasurement2D from "esri/widgets/AreaMeasurement2D";
import DirectLineMeasurement3D from "esri/widgets/DirectLineMeasurement3D";
import AreaMeasurement3D from "esri/widgets/AreaMeasurement3D";
let activeWidget = null;
function measure(mapview, selectedButton, is2D, measure_type){
  if(is2D){
    measure2D(mapview,selectedButton,measure_type)
  }else{
    measure3D(mapview,selectedButton,measure_type)
  }
}
function clearMeasure(type, mapview, selectedButton){
  setActiveWidget(type, mapview, selectedButton)
  setActiveButton(selectedButton,mapview)
}
function measure2D(mapview, selectedButton,measure_type) {
  mapview.graphics.removeAll();
  setActiveWidget(null, mapview, selectedButton);
  if (!selectedButton.classList.contains("active")) {
    setActiveWidget(measure_type, mapview, selectedButton);//"distance",
  } else {
    setActiveButton(null, mapview);
  }
}
function measure3D(mapview, selectedButton,measure_type) {
  setActiveWidget3D(null, mapview, selectedButton);
  if (!selectedButton.classList.contains("active")) {
    setActiveWidget3D(measure_type, mapview, selectedButton);
  } else {
    setActiveButton(null, mapview);
  }
}
function setActiveButton(selectedButton, mapview) {
  mapview.focus();
  let elements = document.getElementsByClassName("active");
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.remove("active");
  }
  if (selectedButton) {
    selectedButton.classList.add("active");
  }
}
function setActiveWidget(type, mapview, selectedButton) {
  switch (type) {
    case "distance":
      activeWidget = new DistanceMeasurement2D({
        view: mapview
      });
      activeWidget.viewModel.newMeasurement();
      // setLineStyle(activeWidget.viewModel.palette);
      mapview.ui.add(activeWidget, "bottom-left");
      setActiveButton(selectedButton, mapview);
      break;
    case "area":
      activeWidget = new AreaMeasurement2D({
        view: mapview
      });
      activeWidget.viewModel.newMeasurement();
      // setFillStyle(activeWidget.viewModel.palette)
      mapview.ui.add(activeWidget, "bottom-left");
      setActiveButton(selectedButton, mapview);
      break;
    case null:
      if (activeWidget) {
        mapview.ui.remove(activeWidget);
        activeWidget.destroy();
        activeWidget = null;
      }
      break;
  }
}
function setActiveWidget3D(type, mapview, selectedButton) {
  switch (type) {
    case "distance":
      activeWidget = new DirectLineMeasurement3D({
        view: mapview
      });
      activeWidget.viewModel.newMeasurement();
      mapview.ui.add(activeWidget, "bottom-left");
      setActiveButton(selectedButton, mapview);
      break;
    case "area":
      activeWidget = new AreaMeasurement3D({
        view: mapview
      });
      activeWidget.viewModel.newMeasurement();
      mapview.ui.add(activeWidget, "bottom-left");
      setActiveButton(selectedButton, mapview);
      break;
    case null:
      if (activeWidget) {
        mapview.ui.remove(activeWidget);
        activeWidget.destroy();
        activeWidget = null;
      }
      break;
  }
}
// function setLineStyle(line){//设置距离测量线的样式
//   line.handleColor = [255,64,64,0.5];
//   line.pathPrimaryColor = [255,48,48,1];
//   line.pathSecondaryColor = [255,48,48,1];
//   line.handleWidth = 8;
//   line.pathWidth = 2;
// }
// function setFillStyle(fill){//设置面积测量面的样式
//   fill.fillColor = [255,48,48,0.3];
//   fill.handleColor = [255,64,64,0.5];
//   fill.pathColor = [255,48,48,0.8];
// }
// function changeColor(measurement){//修改测量线条的颜色，配合"esri/widgets/Measurement"使用
//   handler= measurement.watch('activeWidget', function (evt) {
//     handler.remove()
//     handler = null
//     if (evt !== null) {
//      // 分别修改距离测量和面积测量句柄的默认样式
//      if (measurement.activeTool === 'distance') {
//       evt.viewModel.palette.handleColor = [255,64,64,0.5];
//       evt.viewModel.palette.pathPrimaryColor = [255,48,48,1];
//       evt.viewModel.palette.pathSecondaryColor = [255,48,48,1];
//       evt.viewModel.palette.handleWidth = 8;
//       evt.viewModel.palette.pathWidth = 2;
//      } else {
//       evt.viewModel.palette.fillColor = [255,48,48,0.3];
//       evt.viewModel.palette.handleColor = [255,64,64,0.5];
//       evt.viewModel.palette.pathColor = [255,48,48,0.8];
//      }
//     }
//    });
// }

export default {
  measure,
  clearMeasure,
};
