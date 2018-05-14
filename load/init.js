/**
 * Created by deii66 on 2018/1/30.
 */
var scene,canvas,width,height,renderer,camera,Trackcontrols,stats,lbbs;
var forestSize = 100;//森林总数
var forest = [];
var leaves = [];
function init() {
    lbbs = new LBBs();
    var canvas = document.getElementById("canvas");
    width = window.innerWidth;
    height = window.innerHeight;
    renderer = new THREE.WebGLRenderer({
        antialias:true,
        canvas:canvas
    });
    renderer.setSize(width,height);
    renderer.setClearColor(0xaaaaaa,1.0);


    scene = new THREE.Scene();
    scene.frustumCulled = false;
    scene.matrixAutoUpdate = false;

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0,1,1).normalize();
    scene.add(light);
    light = new THREE.AmbientLight(0xffffff,1);
    scene.add(light);


    camera = new THREE.PerspectiveCamera(45,width/height,1,10000);
    camera.position.y = 50;
    camera.position.z = 1000;
    camera.lookAt(0,0,0);

    Trackcontrols = new THREE.TrackballControls( camera, renderer.domElement );

    initStats();
    initGui();
    initScene();
    animate();
}
function initStats() {

    stats = new Stats();

    stats.setMode(0); // 0: fps, 1: ms

    // 放在左上角
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);

    return stats;
}
//控制界面参数
var controls = new function (){
    this.AL06a = false;
    this.Blue_Spruce = false;
    this.BS07a = false;
    this.TreeNumber = forestSize;
    this.Delete = function(){
        for(var i=0 ; i <forest.length;i++){
            for(var j = 0;j<forest[i].length;j++) {
                scene.remove(forest[i][j]);
            }
        }
    };
    this.Blend = function (){
        if(this.AL06a == true && this.Blue_Spruce==true){
            THREE.Cache.clear();
            initObject("AL06a","Blue Spruce",this.TreeNumber);
        }
        else if(this.AL06a == true && this.BS07a == true){
            THREE.Cache.clear();
            initObject("AL06a","BS07a",this.TreeNumber);
        }
        else if(this.Blue_Spruce == true && this.BS07a == true){
            THREE.Cache.clear();
            initObject("Blue Spruce","BS07a",this.TreeNumber);
        }
    }
};
//控制界面
function initGui(){
    var dataGui = new dat.GUI();
    dataGui.add(controls,'AL06a');
    dataGui.add(controls,'Blue_Spruce');
    dataGui.add(controls,'BS07a');
    dataGui.add(controls,'Blend');
    dataGui.add(controls,"TreeNumber",50,5000).step(50);
    dataGui.add(controls,'Delete');
}
//初始化场景
function initScene() {
    scene.add(loadGround());
    scene.add(loadSky());
}
function leavesupdate(){
    for(var j=0,jl=leaves.length;j<jl;j++){
        leaves[j].visible = (j%leaves[j].level == 0);
        leaves[j].update();
    }
}
//从画面中剔除部分距离较远的树木
function forestupdate(){
    var cameraMatrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    for(var j=0,jl=forest.length;j<jl;j++) {
        var point = new THREE.Vector3(forest[j][0].position.x,forest[j][0].position.y,forest[j][0].position.z);
        var z = point.applyMatrix4(cameraMatrix).z;
        var dist = forest[j][0].position.clone();
        dist.sub(camera.position);
        dist = dist.x * dist.x + dist.y * dist.y + dist.z * dist.z ;
        var le = 0;
        for (var i = 0, il = LevelDefine.length; i < il; i++) {
            if (dist > LevelDefine[i])le++;
            else break;
        }
        forest[j][0].visible = (j % le == 0);
        if(forest[j][0].visible == false){
            for(var i = 0;i<forest[j].length;i++){
                forest[j][i].visible = false;
            }
        }
        else if(z>1){
            forest[j][0].visibale = false;
            for(var i = 0;i<forest[j].length;i++){
                forest[j][i].visible = false;
            }
        }
        else{
            for(var i = 0;i<forest[j].length;i++){
                forest[j][i].visible = true;
            }
        }
    }
}
//function FOI(){
//    var cameraMatrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
//    for(var j=0,jl=forest.length;j<jl;j++) {
//        var point = new THREE.Vector3(forest[j][0].position.x,forest[j][0].position.y,forest[j][0].position.z);
//        var z = point.applyMatrix4(cameraMatrix).z;
//        if(z>1) {
//            forest[j][0].visibale = false;
//            for(var i = 0;i<forest[j].length;i++){
//                forest[j][i].visible = false;
//            }
//        }
//        else if(forest[j][0].visibale == true){
//            for(var i = 0;i<forest[j].length;i++){
//                forest[j][i].visible = true;
//            }
//        }
//    }
//}
var clock = new THREE.Clock();
function animate() {
    forestupdate();
    //leavesupdate();
    var delta = clock.getDelta();
    Trackcontrols.update(delta);
    stats.begin();
    renderer.clear();
    renderer.setFaceCulling(THREE.CullFaceBack,THREE.FrontFaceDirectionCW);
    renderer.render(scene,camera);
    stats.end();
    //lbbs.update();
    requestAnimationFrame(animate);
}
