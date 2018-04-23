var branchImg;
var leafMat;
var material;
var leafMesh;
var LevelDefine = [0,10000,150000,250000,500000,1000000,2000000,3000000,4000000,5000000,6000000,7000000,8000000,9000000,10000000,15000000,25000000];
var LeavesLevelDefine = [0,10000,250000,1000000];
//天空盒
function loadSky() {
    //add skybox
    var urlPrefix = "../textures/skybox/";
    var urls = [ urlPrefix + "px.jpg", urlPrefix + "nx.jpg",
        urlPrefix + "py.jpg", urlPrefix + "ny.jpg",
        urlPrefix + "pz.jpg", urlPrefix + "nz.jpg" ];
    var textureCube = THREE.ImageUtils.loadTextureCube( urls );
    var shader = THREE.ShaderLib["cube"];
    shader.uniforms['tCube'].value= textureCube;   // textureCube has been init before
    var material = new THREE.ShaderMaterial({
        fragmentShader    : shader.fragmentShader,
        vertexShader  : shader.vertexShader,
        uniforms  : shader.uniforms,
        depthWrite:false,
        side:THREE.BackSide
    });
    // build the skybox Mesh
    // add it to the scene
    return new THREE.Mesh(new THREE.CubeGeometry(5000, 5000, 5000), material);
}
//地面
function loadGround() {
    //add ground
    var texture2 = THREE.ImageUtils.loadTexture("../textures/terrain/grasslight-big.jpg");
    texture2.wrapS = THREE.RepeatWrapping;
    texture2.wrapT = THREE.RepeatWrapping;
    texture2.repeat.set(100*50/100,100*50/100);
    var plane = new THREE.PlaneGeometry(5000,5000);
    plane.rotateX(-Math.PI/2);
    return new THREE.Mesh(plane, new THREE.MeshLambertMaterial({
        map: texture2
    }));
}
//初始化树木
function initObject(tree1,tree2,forestsize){
    branchImg = new THREE.ImageUtils.loadTexture("../textures/tree/diffuse-min.png");
    leafMat = new THREE.MeshLambertMaterial({
        map:THREE.ImageUtils.loadTexture("../textures/tree/leaf01-min.png"),
        color:0x253F08,
        side:THREE.DoubleSide,
        transparent:true,
        depthTest:false
    });
    material = new THREE.MeshLambertMaterial({
        // wireframe:true,
        side:THREE.DoubleSide,
        map:branchImg
    });
    var leaf_size = 5;
    var geo = new THREE.PlaneBufferGeometry(leaf_size,leaf_size);
    leafMesh = new THREE.Mesh(geo,leafMat);
    leafMesh.geometry.translate(0,leaf_size/2.0,0);

    for(var i = 0 ;i<forestsize/500||forestsize/10<50 ; i++) {
        if(forestsize/10 <50){
            $.get("http://127.0.0.1:9091/getTreeModel?pageId=" + i, {}, function (result) {
                newtreecircle(result, forestsize/50, tree1, tree2);
            });
            break;
        }
        else {
            $.get("http://127.0.0.1:9091/getTreeModel?pageId=" + i, {}, function (result) {
                newtreecircle(result, 10, tree1, tree2);
            });
        }
        if(i+1>forestsize/500-1 && forestsize%500!=0){
            $.get("http://127.0.0.1:9091/getTreeModel?pageId=" + i+1, {}, function (result) {
                newtreecircle(result, forestsize%500/50, tree1, tree2);
            });
            break;
        }
    }
}
//从MongoDB中取出过渡树木参数，转换为圆环序列
var row = -24;
function newtreecircle(content,forestsize,tree1,tree2){
    var treeID = tree1+"_"+tree2;
    var treecircle = [];
    var circle;
    var x="", y="",z="";
    var radius="";
    var branchcircle = [];

    for(var i = 0 ; i < forestsize;i++) {
        if (content[i].TreeID == treeID) {
            treecircle = [];
            x = "";
            y = "";
            z = "";
            radius = "";
            branchcircle = [];
            for (var j = 0; j < content[i].treedata.length; j++) {
                if (content[i].treedata[j] == 'b') {
                    if (branchcircle.length != 0)
                        treecircle.push(branchcircle);
                    branchcircle = [];
                    j += 5;
                }
                else if (content[i].treedata[j] == 'x') {
                    for (var m = j + 1; content[i].treedata[m] != 'y'; m++) {
                        x += content[i].treedata[m];
                    }
                    j += x.length;
                }
                else if (content[i].treedata[j] == 'y') {
                    for (var m = j + 1; content[i].treedata[m] != 'z'; m++) {
                        y += content[i].treedata[m];
                    }
                    j += y.length;
                }
                else if (content[i].treedata[j] == 'z') {
                    for (var m = j + 1; content[i].treedata[m] != 'r'; m++) {
                        z += content[i].treedata[m];
                    }
                    j += z.length;
                }
                else if (content[i].treedata[j] == 'r') {
                    for (var m = j + 6; m < content[i].treedata.length && (content[i].treedata[m] != 'x' && content[i].treedata[m] != 'b'); m++) {
                        radius += content[i].treedata[m];
                    }
                    j += radius.length + 5;
                    circle = {
                        radius: parseFloat(radius/10),
                        pos: new THREE.Vector3(parseFloat(x/10), parseFloat(y/10), parseFloat(z/10))
                    };
                    branchcircle.push(circle);
                    x = "";
                    y = "";
                    z = "";
                    radius = "";
                }
            }

            draw(treecircle);
            for(var cl = 0 ;cl<49;cl++) {
                var temp = [];
                for (var j = 0; j < tree.length; j++) {
                    temp.push(tree[j].clone());
                }
                forest.push(temp);
                moveTree(temp, cl+1, 0,Math.floor(Math.random() * 60 + 1));
            }
            row++;
            tree = [];
        }
    }
}
/*function readFile(txt1){
    var treecircle = [];
    var loaderTree1 = new THREE.FileLoader();

//load a text file a output the result to the console
    loaderTree1.load(
        // resource URL
        txt1,

        // Function when resource is loaded
        function ( data ) {
            var layer = [];
            var circle;
            var x="", y="",z="";
            var radius="";
            var temp=0;
            var branchlength="";
            var trunk=[];
            var child="";
            var position="";
            // output the text to the console
            for(var i=0;i<data.length;i++) {
                temp = 0;
                x="";
                y="";
                z="";
                radius="";
                if(data[i]=='L'){
                    var number=data[i+9].toString();
                    if(data[i+10]!='\r') {
                        number += data[i + 10].toString();
                        if (data[i + 11] != '\r') {
                            number += data[i + 11].toString();
                            i+=14;
                        }
                        else{
                            i+=13;
                        }
                    }
                    else{
                        i+=12;
                    }
                    number = parseInt(number);
                }
                if(data[i+5]=='\r'||data[i+4]=='\r'||data[i+3]=='\r') {
                    branchlength='';
                    child='';
                    position='';
                    while (data[i] != ' ') {
                        child += data[i].toString();
                        i++;
                    }
                    i++;
                    while (data[i] != '\r'){
                        position += data[i].toString();
                        i++;
                    }
                    i+=2;
                    while (data[i] != '\r') {
                        branchlength += data[i].toString();
                        i++;
                    }
                    i += 2;
                }
                for(var j=i;data[j]!='\r'&&j<data.length;j++) {
                    if(data[j]!=' ') {
                        if(temp==0){
                            x+=data[j];
                        }
                        if(temp==1){
                            y+=data[j];
                        }
                        if(temp==2){
                            z+=data[j];
                        }
                        if(temp==3){
                            radius+=data[j];
                        }
                    }
                    else{
                        temp++;
                    }
                }
                i = j+1;
                if(branchlength!=0) {
                    circle = {
                        radius: radius * 70,
                        position:position,//
                        child:child,
                        pos: new THREE.Vector3(x * 70, y * 70, z * 70)
                    };
                    trunk.push(circle);
                    branchlength--;
                    if(branchlength==0){
                        layer.push(trunk);
                        number--;
                        if(number == 0){
                            treecircle.push(layer);
                            layer = [];
                        }
                        trunk=[];
                    }
                }
            }
            draw(treecircle);
        },

        // Function called when download progresses
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // Function called when download errors
        function ( xhr ) {
            console.error( 'An error happened' );
        }
    );

}*/
//将圆环序列还原成树
var tree = [];
function draw(treecircle){

    drawTree(treecircle);
    addLeaf(treecircle);
    tree[0].maintrunk = true;
    tree[0].childs = [];
    for(var i = 1;i<tree.length;i++){
        tree[0].childs.push(tree[i]);
    }
    moveTree(tree,-24,row,Math.floor(Math.random() * 60 + 1));
    forest.push(tree);
}
//有buffer的老版本drawbranch，绘制每一个branch
var geo = new THREE.BufferGeometry();
function drawBranch(trunk) {

    var seg = 5 ;
    var vertices = [];
    var _32array = [];
    for (var i = 0, l = trunk.length; i < l - 1; i++) {
        geo = new THREE.BufferGeometry();
        var circle = trunk[i];
        for (var s = 0; s < seg; s++) {//for each point in the circle
            var rd = circle.radius;
            var pos = new THREE.Vector3(0, 0, 0);
            var posx = 0, posy = 0, posz = 0;
            if (i > 0) {
                posx = Math.abs(trunk[i].pos.x - trunk[i - 1].pos.x);
                posy = Math.abs(trunk[i].pos.y - trunk[i - 1].pos.y);
                posz = Math.abs(trunk[i].pos.z - trunk[i - 1].pos.z);
            }
            if (i == 0) {
                posx = Math.abs(trunk[i + 1].pos.x - trunk[i].pos.x);
                posy = Math.abs(trunk[i + 1].pos.y - trunk[i].pos.y);
                posz = Math.abs(trunk[i + 1].pos.z - trunk[i].pos.z);
            }
            if (posx >= posy && posx >= posz) {
                pos.x = 0;
                pos.y = rd * Math.sin(2 * Math.PI / seg * s);
                pos.z = rd * Math.cos(2 * Math.PI / seg * s);
            }
            if (posz >= posx && posz >= posy) {
                pos.x = rd * Math.sin(2 * Math.PI / seg * s);
                pos.y = rd * Math.cos(2 * Math.PI / seg * s);
                pos.z = 0;
            }
            if (posy >= posz && posy >= posx) {
                pos.x = rd * Math.cos(2 * Math.PI / seg * s);
                pos.y = 0;
                pos.z = rd * Math.sin(2 * Math.PI / seg * s);
            }
            vertices.push(pos.add(circle.pos));
        }
    }
    vertices.push(trunk[trunk.length - 1].pos);
    _32array = translate(vertices);

    geo.addAttribute('position', new THREE.Float32BufferAttribute(_32array, 3));
    geo.computeVertexNormals();
    var branch = new THREE.Mesh(geo, material);
    tree.push(branch);
    //lbbs.add(branch);
    //forest.push(branch);
}
//点集转换为32Array，用于BufferGeometry的position属性
function translate(vertices){
    var precision =5;
    var _32array = [];
    for(var i=0;i<vertices.length;i++){
        if((i+1) %5 == 0 && i + 1 != vertices.length-1){
            _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
            _32array.push(vertices[i - precision +1].x, vertices[i - precision +1].y, vertices[i - precision +1].z);
            _32array.push(vertices[i + precision].x, vertices[i + precision].y, vertices[i + precision].z);
        }
        else if(i == vertices.length-1){
            _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
        }
        else if(i + 1 == vertices.length-1){
            _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
            _32array.push(vertices[i- precision +1].x, vertices[i- precision +1].y, vertices[i- precision +1].z);
            _32array.push(vertices[vertices.length-1].x, vertices[vertices.length-1].y, vertices[vertices.length-1].z);
        }
        else if(i + precision >= vertices.length-1){
            _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
            _32array.push(vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z);
            _32array.push(vertices[vertices.length-1].x, vertices[vertices.length-1].y, vertices[vertices.length-1].z);
        }
        else {
            _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
            _32array.push(vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z);
            _32array.push(vertices[i + precision].x, vertices[i + precision].y, vertices[i + precision].z);
        }
    }
    for(var j = vertices.length-2; j>=5;j--){
        if(j % 5 ==0){
            _32array.push(vertices[j].x, vertices[j].y, vertices[j].z);
            _32array.push(vertices[j + precision -1].x, vertices[j + precision -1].y, vertices[j + precision -1].z);
            _32array.push(vertices[j - 1].x, vertices[j - 1].y, vertices[j -1].z);
        }
        else{
            _32array.push(vertices[j].x, vertices[j].y, vertices[j].z);
            _32array.push(vertices[j - 1].x, vertices[j - 1].y, vertices[j - 1].z);
            _32array.push(vertices[j - precision -1].x, vertices[j - precision -1].y, vertices[j - precision -1].z);
        }
    }
    return _32array;
}
//绘制一棵树
function drawTree(blendtree){
    for(var i=0;i<blendtree.length;i++) {
        drawBranch(blendtree[i]);

    }
}
//添加叶子，在圆环序列上随机添加叶子
function addLeaf(trunk){

    for(var i = 1;i<trunk.length;i++) {
        for(var j = Math.floor(trunk[i].length/2+Math.floor(Math.random()*4 + 1));j<trunk[i].length;j+=Math.floor(Math.random()*3 + 1)) {
            for (var k = Math.floor(Math.random() * 6 + 1); k < 2; k++) {
                var leaf = new RTLeaf();
                leaf.init();
                leaf.instance(trunk,i,j);
                tree.push(leaf.mesh);
                //forest.push(leaf.mesh);
                leaves.push(leaf);
                //lbbs.add(leaf);
            }
        }
    }
}
//修改树木的位置
function moveTree(trees,x,z,random){
    for(var i=0; i <trees.length;i++){
        trees[i].position.x -= x*100 + random;
        trees[i].position.z -= z*100 + random;
        scene.add(trees[i]);
    }
}
//实例化叶子
function RTLeaf() {
    this.parent = null;
    this.level = 0;

    this.size = 1.0;
    this.phi = 0;
    this.theta = 0;
    this.location = 0.5;
    this.selfRotate = 0;

    this.mesh = null;

    this.visible = true;
}

RTLeaf.prototype = {
    update:function () {
        var dist = this.mesh.position.clone();
        dist.sub(camera.position);
        dist = dist.x*dist.x+dist.y*dist.y+dist.z*dist.z;
        var le=0;
        for(var i=0,il=LeavesLevelDefine.length;i<il;i++){
            if(dist>LeavesLevelDefine[i])le++;
            else break;
        }
        this.level = le;
        this.mesh.visible = this.visible;
    },
    init:function () {
        this.phi = Math.random()*60+20;
        this.theta = Math.random()*360;
        this.selfRotate = Math.random()*360;
    },
    instance:function (trunk,i,j) {
        var mesh = leafMesh.clone();
        mesh.rotateY(this.theta/180*Math.PI);
        mesh.rotateZ(this.phi/180*Math.PI);
        mesh.rotateY(this.selfRotate/180*Math.PI);
        mesh.position.x = trunk[i][j].pos.x;
        mesh.position.z = trunk[i][j].pos.z;
        mesh.position.y = trunk[i][j].pos.y;
        this.size *= 2-this.location;
        mesh.scale.x = mesh.scale.y = mesh.scale.z = this.size;
        this.mesh = mesh;

    }
};