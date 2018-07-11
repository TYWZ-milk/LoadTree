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


    camera = new THREE.PerspectiveCamera(45,width/height,1,100000);
    camera.position.y = 3000;
    camera.position.z = 1000;
    camera.lookAt(0,0,0);

    Trackcontrols = new THREE.OrbitControls( camera, renderer.domElement );
    Trackcontrols.movementSpeed = 500;
    Trackcontrols.lookSpeed = 0.1;
    Trackcontrols.lookVertical = true;

    initStats();
    initGui();
    initScene();
    //smallMap();
    animate();
}
//小地图
function smallMap(){
    var plane2Geometry = new THREE.PlaneGeometry(60, 40, 1, 1);
    var plane2Material = new THREE.MeshLambertMaterial({color: 0xffffff});
    var plane2 = new THREE.Mesh(plane2Geometry, plane2Material);
    plane2.receiveShadow = true;
    plane2.rotation.x = -0.5 * Math.PI;
    plane2.position.x = 0;
    plane2.position.y = 0;
    plane2.position.z = 0;
    var scene2 = new THREE.Scene();
    scene2.add(groud);

    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene2.add(ambientLight);
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, 20);
    spotLight.castShadow = true;
    scene2.add(spotLight);


    var camera2 = new THREE.PerspectiveCamera(50, window.innerWidth/ window.innerHeight, 0.1, 2000);
    camera2.position.x = 0;
    camera2.position.y = 50;
    camera2.position.z = 0;
    camera2.lookAt(scene2.position);

    var renderer2 = new THREE.WebGLRenderer({ alpha: true });
    renderer2.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer2.setSize(300, 300 );
    renderer2.shadowMapEnabled = true;
    document.getElementById('demo').appendChild(renderer2.domElement);

    render2();
    function update(){

        plane2.position.x=groud.position.x;
        plane2.position.y=groud.position.y;
        plane2.position.z=groud.position.z;
        plane2.rotation.x=groud.rotation.x;
        plane2.rotation.y=groud.rotation.y;
        plane2.rotation.z=groud.rotation.z;
        plane2.scale.x=groud.scale.x;
        plane2.scale.y=groud.scale.y;
        plane2.scale.z=groud.scale.z;
    }

    function render2() {
        update();

        renderer2.render(scene2, camera2);
        requestAnimationFrame(render2);
    }

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
var orbit1 = false;
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
    };
    this.Orbit = function (){
        orbit1 = true;
        camera.position.set(-4000,1300,-4000);
    };
};
//控制界面
function initGui(){
    var dataGui = new dat.GUI();
    dataGui.add(controls,'AL06a');
    dataGui.add(controls,'Blue_Spruce');
    dataGui.add(controls,'BS07a');
    dataGui.add(controls,'Blend');
    dataGui.add(controls,"TreeNumber",50,15000).step(50);
    dataGui.add(controls, "Orbit");
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
        //if(j>2) {
            forest[j][0].visible = (j % le == 0);
        //}
        if(forest[j][0].visible == false){
            for(var i = 0;i<forest[j].length;i++){
                forest[j][i].visible = false;
            }
        }
        //else if(z>1){
        //    for(var i = 0;i<forest[j].length;i++){
        //        forest[j][i].visible = false;
        //    }
        //}
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

function orbit(){
    if(orbit1 == true) {
        Trackcontrols.enabled = false;
        camera.lookAt(0,0,0);
        if(camera.position.x < 4000 && camera.position.z == -4000)
            camera.position.x = camera.position.x + 10;
        else if(camera.position.x == 4000 && camera.position.z <4000)
            camera.position.z = camera.position.z + 10;
        else if(camera.position.z == 4000 && camera.position.x > -4000)
            camera.position.x = camera.position.x - 10;
        else if(camera.position.x == -4000 && camera.position.z > 0)
            camera.position.z = camera.position.z - 10;
        else if(camera.position.x <0 && camera.position.z ==0)
            camera.position.x = camera.position.x + 10;
        else if(camera.position.x ==0 && camera.position.z ==0)
        {
            Trackcontrols.enabled = true;
            orbit1 = false;
        }
    }
}


var clock = new THREE.Clock();
function animate() {
    var d= new Date();
    if(d.getSeconds()%10 == 0)
        forestupdate();
    //leavesupdate();
    var delta = clock.getDelta();
    orbit();
    Trackcontrols.update(delta);
    stats.begin();
    renderer.clear();
    renderer.render(scene,camera);
    stats.end();
    //lbbs.update();
    requestAnimationFrame(animate);
}
