class Factory{
  constructor(){
　}
}
class ShapeFactory extends Factory{
  Product(type){
    let production;
    switch(type){
      case 'point':
        production=new VPPointSymbol();
        break;
      case 'polyline':
        production=new VPLineSymbol();
      break;
      case 'polygon':
        production=new VPPolygonSymbol();
      break;
    }
    return production
  }
}
class VPPoint{
  constructor(){
  }
}
class VPPointSymbol extends VPPoint{
  Product(fillType,lineType){
    let production;
    switch(fillType){
      case 'circle':
        production=new VPPointCircle();
        break;
      case 'cross':
        production=new VPPointCross();
      break;
      case 'diamond':
        production=new VPPointDiamond();
      break;
      case 'square':
        production=new VPPointSquare();
      break;
      case 'triangle':
        production=new VPPointTriangle();
      break;
      case 'x':
        production=new VPPointX();
      break;
      default:
        production=new VPPointCircle();
    }
    return production
  }
}
class VPPointCircle{//点（圆）
  draw(obj,ctx){
    ctx.beginPath();
    let vlineWidth = 2
    ctx.lineWidth = vlineWidth
    ctx.arc(obj.size/2,obj.size/2,obj.size/2 - vlineWidth * 2,0,2 * Math.PI);//ctx.arc(40,70,20,0,2 * Math.PI);
    ctx.strokeStyle = obj.outlineColor ? obj.outlineColor :null;
    if(obj.symbolColor){
      ctx.fillStyle = obj.symbolColor ;
      ctx.fill();
    }
    ctx.stroke();
  }
}
class VPPointCross{//点（十字丝）
  draw(obj,ctx){
    ctx.beginPath();
    let vlineWidth = 2
    ctx.lineWidth = vlineWidth
    ctx.moveTo(obj.size/2 - 3, vlineWidth * 2);
    ctx.lineTo(obj.size/2 + 3, vlineWidth * 2);
    ctx.lineTo(obj.size/2 + 3, obj.size/2 - 3);
    ctx.lineTo(obj.size - vlineWidth * 2, obj.size/2 - 3);
    ctx.lineTo(obj.size - vlineWidth * 2, obj.size/2 + 3);
    ctx.lineTo(obj.size/2 + 3, obj.size/2 + 3);
    ctx.lineTo(obj.size/2 + 3, obj.size - vlineWidth * 2);
    ctx.lineTo(obj.size/2 - 3, obj.size - vlineWidth * 2);
    ctx.lineTo(obj.size/2 - 3, obj.size/2 + 3);
    ctx.lineTo(vlineWidth * 2, obj.size/2 + 3);
    ctx.lineTo(vlineWidth * 2, obj.size/2 - 3);
    ctx.lineTo(obj.size/2 - 3, obj.size/2 - 3);
    ctx.closePath();
    ctx.strokeStyle = obj.outlineColor ? obj.outlineColor :null;
    if(obj.symbolColor){
      ctx.fillStyle = obj.symbolColor;
      ctx.fill();
    }
    ctx.stroke();
  }
}
class VPPointDiamond{//点（菱形）
  draw(obj,ctx){
    ctx.beginPath();
    let vlineWidth = 2
    ctx.lineWidth = vlineWidth
    ctx.moveTo(obj.size/2, vlineWidth);
    ctx.lineTo(obj.size * 3 / 4, obj.size/2);
    ctx.lineTo(obj.size/2, obj.size - vlineWidth);
    ctx.lineTo(obj.size/4, obj.size/2);
    ctx.closePath();
    ctx.strokeStyle = obj.outlineColor ? obj.outlineColor :null;
    if(obj.symbolColor){
      ctx.fillStyle = obj.symbolColor;
      ctx.fill();
    }
    ctx.stroke();
  }
}
class VPPointSquare{//点（方形）
  draw(obj,ctx){
    let vlineWidth = 2
    if(obj.symbolColor){
      ctx.fillStyle = obj.symbolColor ;
      ctx.fill();
      ctx.fillRect(vlineWidth * 2, vlineWidth * 2, obj.size - 4 * vlineWidth, obj.size - 4 * vlineWidth);
    }
    ctx.lineWidth = vlineWidth
    ctx.strokeStyle = obj.outlineColor ? obj.outlineColor :null;
    ctx.strokeRect(vlineWidth * 2, vlineWidth * 2, obj.size - 4 * vlineWidth, obj.size - 4 * vlineWidth)
  }
}
class VPPointTriangle{//点（三角）
  draw(obj,ctx){
    let vlineWidth = 2
    ctx.beginPath();
    ctx.lineWidth = vlineWidth
    ctx.moveTo(obj.size / 2, vlineWidth * 2);
    ctx.lineTo(vlineWidth * 2, obj.size - vlineWidth * 2);
    ctx.lineTo(obj.size - vlineWidth * 2, obj.size - vlineWidth * 2);
    ctx.closePath();
    ctx.strokeStyle = obj.outlineColor ? obj.outlineColor :null;
    if(obj.symbolColor){
      ctx.fillStyle = obj.symbolColor;
      ctx.fill();
    }
    ctx.stroke();
  }
}
class VPPointX{//点（X）
  draw(obj,ctx){
    let vlineWidth = 2
    ctx.setTransform(1,1,-1,1,obj.size/2,-obj.size/2);
    ctx.beginPath();
    ctx.lineWidth = vlineWidth
    ctx.moveTo(obj.size/2 - 3, vlineWidth * 2);
    ctx.lineTo(obj.size/2 + 3, vlineWidth * 2);
    ctx.lineTo(obj.size/2 + 3, obj.size/2 - 3);
    ctx.lineTo(obj.size - vlineWidth * 2, obj.size/2 - 3);
    ctx.lineTo(obj.size - vlineWidth * 2, obj.size/2 + 3);
    ctx.lineTo(obj.size/2 + 3, obj.size/2 + 3);
    ctx.lineTo(obj.size/2 + 3, obj.size - vlineWidth * 2);
    ctx.lineTo(obj.size/2 - 3, obj.size - vlineWidth * 2);
    ctx.lineTo(obj.size/2 - 3, obj.size/2 + 3);
    ctx.lineTo(vlineWidth * 2, obj.size/2 + 3);
    ctx.lineTo(vlineWidth * 2, obj.size/2 - 3);
    ctx.lineTo(obj.size/2 - 3, obj.size/2 - 3);
    ctx.closePath();
    ctx.strokeStyle = obj.outlineColor ? obj.outlineColor :null;
    if(obj.symbolColor){
      ctx.fillStyle = obj.symbolColor;
      ctx.fill();
    }
    ctx.stroke();
  }
}

class VPLine{
  constructor(){
  }
}
class VPLineSymbol extends VPLine{
  Product(fillType,lineType){
    let production;
    switch(lineType){
      case 'solid':
        production=new VPLineSolid();
        break;
      case 'dash':
        production=new VPLineDash();
      break;
      case 'dash-dot':
        production=new VPLineDashDot();
      break;
      case 'dot':
        production=new VPLineDot();
      break;
      case 'long-dash':
        production=new VPLineLongDash();
      break;
      case 'long-dash-dot':
        production=new VPLineLongDashDot();
      break;
      case 'long-dash-dot-dot':
        production=new VPLineLongDashDotDot();
      break;
      case 'short-dash':
        production=new VPLineShortDash();
      break;
      case 'short-dash-dot':
        production=new VPLineShortDashDot();
      break;
      case 'short-dash-dot-dot':
        production=new VPLineShortDashDotDot();
      break;
      case 'short-dot':
        production=new VPLineShortDot();
      break;
      case 'none':
        production=new VPLineNone();
      break;
      default:
        production=new VPLineSolid();
    }
    return production
  }
}
class VPLineSolid{//线（实线）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineDash{//线（虚线）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.setLineDash([4 * obj.dash, obj.dash])
    ctx.lineDashOffset = -0;
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineDashDot{//线（虚线-点）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.setLineDash([4 * obj.dash, obj.dash, obj.dash, obj.dash])
    ctx.lineDashOffset = -0;
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineDot{//线（点）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.setLineDash([obj.dash, 2 * obj.dash])
    ctx.lineDashOffset = -0;
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineLongDash{//线（长虚线）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.setLineDash([8 * obj.dash, obj.dash])
    ctx.lineDashOffset = -0;
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineLongDashDot{//线（长虚线-点）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.setLineDash([8 * obj.dash, obj.dash, obj.dash, obj.dash])
    ctx.lineDashOffset = -0;
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineLongDashDotDot{//线（长虚线-点-点）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.setLineDash([8 * obj.dash, obj.dash, obj.dash, obj.dash, obj.dash, obj.dash])
    ctx.lineDashOffset = -0;
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineShortDash{//线（短虚线）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.setLineDash([2 * obj.dash, obj.dash])
    ctx.lineDashOffset = -0;
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineShortDashDot{//线（短虚线-点）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.setLineDash([2 * obj.dash, obj.dash, obj.dash, obj.dash])
    ctx.lineDashOffset = -0;
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineShortDashDotDot{//线（短虚线-点-点）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.setLineDash([2 * obj.dash, obj.dash, obj.dash, obj.dash, obj.dash, obj.dash])
    ctx.lineDashOffset = -0;
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineShortDot{//线（短点）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.lineWidth = 3
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.setLineDash([obj.dash, obj.dash])
    ctx.lineDashOffset = -0;
    ctx.strokeStyle = obj.outlineColor;
    ctx.stroke();
  }
}
class VPLineNone{//线（无）
  draw(obj,ctx){
    ctx.beginPath();
    ctx.moveTo(0, obj.size / 2);
    ctx.lineTo(obj.size, obj.size / 2);
    ctx.strokeStyle = obj.outlineColor? obj.outlineColor: null;
    ctx.stroke();
  }
}

class VPPolygon{
  constructor(){
  }
}
class VPPolygonSymbol extends VPPolygon{
  Product(fillType,lineType){
    let production;
    switch(fillType){
      case 'solid':
        production=new VPPolygonSolid(fillType,lineType);
      break;
      case 'backward-diagonal':
        production=new VPPolygonBackwardDiagonal(fillType,lineType);
      break;
      case 'cross':
        production=new VPPolygonCross(fillType,lineType);
      break;
      case 'diagonal-cross':
        production=new VPPolygonDiagonalCross(fillType,lineType);
      break;
      case 'forward-diagonal':
        production=new VPPolygonForwardDiagonal(fillType,lineType);
      break;
      case 'horizontal':
        production=new VPPolygonHorizontal(fillType,lineType);
      break;
      case 'vertical':
        production=new VPPolygonVertical(fillType,lineType);
      break;
      case 'none':
        production=new VPPolygonNone(fillType,lineType);
      break;
      default:
        production=new VPPolygonSolid('solid',lineType);
    }
    return production
  }
}
class VPPolygonShape{
  constructor(fillType,lineType){
    this.fillType=fillType;
    this.lineType=lineType;
  }
}
class VPPolygonSolid extends VPPolygonShape{//面（简单符号颜色填充）
  draw(obj,ctx){
    let vlineWidth = 2
    ctx.lineWidth = vlineWidth
    ctx.strokeStyle = obj.outlineColor;
    drawFrame(this.lineType,ctx,obj.dash)
    ctx.strokeRect(vlineWidth, obj.size/4, obj.size - 2 * vlineWidth, obj.size/2)
    if(obj.symbolColor){
      ctx.fillStyle = obj.symbolColor;
      ctx.fill();
      ctx.fillRect(vlineWidth, obj.size/4, obj.size - 2 * vlineWidth, obj.size/2);
    }
  }
}
class VPPolygonBackwardDiagonal extends VPPolygonShape{//面（反斜线）
  draw(obj,ctx){
    let vlineWidth = 2
    ctx.lineWidth = vlineWidth
    ctx.strokeStyle = obj.outlineColor;
    ctx.save();
    drawFrame(this.lineType,ctx,obj.dash)
    ctx.strokeRect(vlineWidth, obj.size/4, obj.size - 2 * vlineWidth, obj.size/2)
    ctx.restore();
    if(obj.symbolColor){
      ctx.lineWidth = 1
      ctx.strokeStyle = obj.symbolColor;
      ctx.moveTo(obj.size/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(vlineWidth, obj.size/2);
      ctx.moveTo(obj.size/2, obj.size/4);
      ctx.lineTo(vlineWidth, obj.size * 3/4);
      ctx.moveTo(obj.size * 3/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(obj.size/4 - vlineWidth/2, obj.size * 3/4);
      ctx.moveTo(obj.size - vlineWidth, obj.size/4);
      ctx.lineTo(obj.size/2, obj.size * 3/4);
      ctx.moveTo(obj.size - vlineWidth, obj.size/2);
      ctx.lineTo(obj.size * 3/4 - vlineWidth/2, obj.size * 3/4);
      ctx.stroke()
    }
  }
}
class VPPolygonCross extends VPPolygonShape{//面（+交叉）
  draw(obj,ctx){
    let vlineWidth = 2
    ctx.lineWidth = vlineWidth
    ctx.strokeStyle = obj.outlineColor;
    ctx.save();
    drawFrame(this.lineType,ctx,obj.dash)
    ctx.strokeRect(vlineWidth, obj.size/4, obj.size - 2 * vlineWidth, obj.size/2)
    ctx.restore();
    if(obj.symbolColor){
      ctx.strokeStyle = obj.symbolColor;
      ctx.moveTo(vlineWidth, obj.size/2 - vlineWidth);
      ctx.lineTo(obj.size - vlineWidth/2, obj.size/2 - vlineWidth);
      ctx.moveTo(obj.size/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(obj.size/4 - vlineWidth/2, obj.size * 3/4);
      ctx.moveTo(obj.size/2, obj.size/4);
      ctx.lineTo(obj.size/2, obj.size * 3/4);
      ctx.moveTo(obj.size * 3/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(obj.size * 3/4 - vlineWidth/2, obj.size * 3/4);
      ctx.stroke()
    }
  }
}
class VPPolygonDiagonalCross extends VPPolygonShape{//面（斜线交叉）
  draw(obj,ctx){
    let vlineWidth = 2
    ctx.lineWidth = vlineWidth
    ctx.strokeStyle = obj.outlineColor;
    ctx.save();
    drawFrame(this.lineType,ctx,obj.dash)
    ctx.strokeRect(vlineWidth, obj.size/4, obj.size - 2 * vlineWidth, obj.size/2)
    ctx.restore();
    if(obj.symbolColor){
      ctx.strokeStyle = obj.symbolColor;
      ctx.moveTo(vlineWidth, obj.size/2);
      ctx.lineTo(obj.size/4 - vlineWidth/2, obj.size * 3/4);
      ctx.moveTo(vlineWidth, obj.size/4);
      ctx.lineTo(obj.size/2, obj.size * 3/4);
      ctx.moveTo(obj.size/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(obj.size * 3/4 - vlineWidth/2, obj.size * 3/4);
      ctx.moveTo(obj.size/2, obj.size/4);
      ctx.lineTo(obj.size - vlineWidth, obj.size * 3/4);
      ctx.moveTo(obj.size * 3/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(obj.size - vlineWidth, obj.size/2);

      ctx.moveTo(obj.size/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(vlineWidth, obj.size/2);
      ctx.moveTo(obj.size/2, obj.size/4);
      ctx.lineTo(vlineWidth, obj.size * 3/4);
      ctx.moveTo(obj.size * 3/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(obj.size/4 - vlineWidth/2, obj.size * 3/4);
      ctx.moveTo(obj.size - vlineWidth, obj.size/4);
      ctx.lineTo(obj.size/2, obj.size * 3/4);
      ctx.moveTo(obj.size - vlineWidth, obj.size/2);
      ctx.lineTo(obj.size * 3/4 - vlineWidth/2, obj.size * 3/4);
      ctx.stroke()
    }
  }
}
class VPPolygonForwardDiagonal extends VPPolygonShape{//面（正斜线）
  draw(obj,ctx){
    let vlineWidth = 2
    ctx.lineWidth = vlineWidth
    ctx.strokeStyle = obj.outlineColor;
    ctx.save();
    drawFrame(this.lineType,ctx,obj.dash)
    ctx.strokeRect(vlineWidth, obj.size/4, obj.size - 2 * vlineWidth, obj.size/2)
    ctx.restore();
    if(obj.symbolColor){
      ctx.strokeStyle = obj.symbolColor;
      ctx.moveTo(vlineWidth, obj.size/2);
      ctx.lineTo(obj.size/4 - vlineWidth/2, obj.size * 3/4);
      ctx.moveTo(vlineWidth, obj.size/4);
      ctx.lineTo(obj.size/2, obj.size * 3/4);
      ctx.moveTo(obj.size/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(obj.size * 3/4 - vlineWidth/2, obj.size * 3/4);
      ctx.moveTo(obj.size/2, obj.size/4);
      ctx.lineTo(obj.size - vlineWidth, obj.size * 3/4);
      ctx.moveTo(obj.size * 3/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(obj.size - vlineWidth, obj.size/2);
      ctx.stroke()
    }
  }
}
class VPPolygonHorizontal extends VPPolygonShape{//面（水平线）
  draw(obj,ctx){
    let vlineWidth = 2
    ctx.lineWidth = vlineWidth
    ctx.strokeStyle = obj.outlineColor;
    ctx.save();
    drawFrame(this.lineType,ctx,obj.dash)
    ctx.strokeRect(vlineWidth, obj.size/4, obj.size - 2 * vlineWidth, obj.size/2)
    ctx.restore();
    if(obj.symbolColor){
      ctx.strokeStyle = obj.symbolColor;
      ctx.moveTo(vlineWidth, obj.size/2 - vlineWidth);
      ctx.lineTo(obj.size - vlineWidth/2, obj.size/2 - vlineWidth);
      ctx.stroke()
    }
  }
}
class VPPolygonVertical extends VPPolygonShape{//面（竖线）
  draw(obj,ctx){
    let vlineWidth = 2
    ctx.lineWidth = vlineWidth
    ctx.strokeStyle = obj.outlineColor;
    ctx.save();
    drawFrame(this.lineType,ctx,obj.dash)
    ctx.strokeRect(vlineWidth, obj.size/4, obj.size - 2 * vlineWidth, obj.size/2)
    ctx.restore();
    if(obj.symbolColor){
      ctx.strokeStyle = obj.symbolColor;
      ctx.moveTo(obj.size/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(obj.size/4 - vlineWidth/2, obj.size * 3/4);
      ctx.moveTo(obj.size/2, obj.size/4);
      ctx.lineTo(obj.size/2, obj.size * 3/4);
      ctx.moveTo(obj.size * 3/4 - vlineWidth/2, obj.size/4);
      ctx.lineTo(obj.size * 3/4 - vlineWidth/2, obj.size * 3/4);
      ctx.stroke()
    }
  }
}
class VPPolygonNone extends VPPolygonShape{//面（无）
  draw(obj,ctx){
    let vlineWidth = 2
    ctx.strokeStyle = obj.outlineColor;
    drawFrame(this.lineType,ctx,obj.dash)
    ctx.strokeRect(vlineWidth, obj.size/4, obj.size - 2 * vlineWidth, obj.size/2)
  }
}
function drawFrame(lineType,ctx,dash){
  switch(lineType){
    case 'solid':
      break;
    case 'dash':
      ctx.setLineDash([4 * dash, dash]);
    break;
    case 'dash-dot':
      ctx.setLineDash([4 * dash, dash, dash, dash]);
    break;
    case 'dot':
      ctx.setLineDash([dash, 2 * dash]);
    break;
    case 'long-dash':
      ctx.setLineDash([8 * dash, dash]);
    break;
    case 'long-dash-dot':
      ctx.setLineDash([8 * dash, dash, dash, dash]);
    break;
    case 'long-dash-dot-dot':
      ctx.setLineDash([8 * dash, dash, dash, dash, dash, dash]);
    break;
    case 'short-dash':
      ctx.setLineDash([2 * dash, dash]);
    break;
    case 'short-dash-dot':
      ctx.setLineDash([2 * dash, dash, dash, dash]);
    break;
    case 'short-dash-dot-dot':
      ctx.setLineDash([2 * dash, dash, dash, dash, dash, dash]);
    break;
    case 'short-dot':
      ctx.setLineDash([dash, dash]);
    break;
    case 'none':
    break;
    default:
    break
  }
  ctx.lineDashOffset = -0;
}
export default {
  ShapeFactory
}
