import proj from "esri/geometry/projection";

var projection={};
init();
function init(){
    require(["esri/geometry/projection"],function(project){      
        let p=proj;
        projection.project=project;
        if(project.isSupported()){
            if(project.isLoaded()){
                //加载完成
                projection.canuse=true;
                projection.message="WebAssembly加载成功，可以转换投影";
            }
            else
            {
                project.load().then(function(){
                    //加载完成
                    projection.canuse=true;
                    projection.message="WebAssembly加载成功，可以转换投影";
                    }   
                );
            }
        }
        else{
            projection.canuse=false;
            projection.message="浏览器不支持WebAssembly，无法在浏览器转换坐标投影";
        }
    });
}
export default projection;