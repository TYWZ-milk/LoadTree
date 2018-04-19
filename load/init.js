/**
 * Created by deii66 on 2018/1/30.
 */
var scene,canvas,width,height,renderer,camera,Trackcontrols,stats,lbbs;
var forestSize = 100;//森林总数
var forest = [];
var leaves = [];
function init() {
    //lbbs = new LBBs();
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
    camera.position.y = 1300;
    camera.position.z = 800;

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
var controls = new function (){
    this.AL06a = false;
    this.Blue_Spruce = false;
    this.BS07a = false;
    this.TreeNumber = forestSize;
    this.Delete = function(){
        for(var i=0 ; i <forest.length;i++){
            scene.remove(forest[i]);
        }
        col = -10;row = -10;
    };
    this.Blend = function (){
        if(this.AL06a == true && this.Blue_Spruce==true){
            THREE.Cache.clear();
            initObject("AL06a","Blue Spruce",this.TreeNumber);
        }
        else if(this.AL06a == true && this.BS07a == true){
            THREE.Cache.clear();
            initObject("AL06a","BS07a_elastic_1_max",this.TreeNumber);
        }
        else if(this.Blue_Spruce == true && this.BS07a == true){
            THREE.Cache.clear();
            initObject("Blue Spruce","BS07a_elastic_1_max",this.TreeNumber);
        }
    }
};
function initGui(){
    var dataGui = new dat.GUI();
    dataGui.add(controls,'AL06a');
    dataGui.add(controls,'Blue_Spruce');
    dataGui.add(controls,'BS07a');
    dataGui.add(controls,'Blend');
    dataGui.add(controls,"TreeNumber",5,2000).step(1);
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
    for(var j=0,jl=forest.length;j<jl;j++) {
        if(forest[j].maintrunk != true) {
            var dist = forest[j].position.clone();
            dist.sub(camera.position);
            dist = dist.x * dist.x + dist.y * dist.y + dist.z * dist.z;
            var le = 0;
            for (var i = 0, il = LevelDefine.length; i < il; i++) {
                if (dist > LevelDefine[i])le++;
                else break;
            }
            forest[j].visible = (j % le == 0);
        }
    }
}
var clock = new THREE.Clock();
function animate() {
    leavesupdate();
    var delta = clock.getDelta();
    Trackcontrols.update(delta);
    stats.begin();
    renderer.clear();
    renderer.render(scene,camera);
    stats.end();
    //lbbs.update();
    requestAnimationFrame(animate);
}
