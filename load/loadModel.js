var branchImg;
var leafMat;
var material;
var leafMesh;
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
    return new THREE.Mesh(new THREE.CubeGeometry(100 * 50, 100 * 50, 100 * 50), material);
}

function loadGround() {
    //add ground
    var texture2 = THREE.ImageUtils.loadTexture("../textures/terrain/grasslight-big.jpg");
    texture2.wrapS = THREE.RepeatWrapping;
    texture2.wrapT = THREE.RepeatWrapping;
    texture2.repeat.set(100*50/100,100*50/100);
    var plane = new THREE.PlaneGeometry(5*1000,5000);
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
    var leaf_size = 20;
    var geo = new THREE.PlaneBufferGeometry(leaf_size,leaf_size);
    leafMesh = new THREE.Mesh(geo,leafMat);
    leafMesh.geometry.translate(0,leaf_size/2.0,0);
    $.get("http://127.0.0.1:9091/getTreeModel",{},function (result) {

        newtreecircle(result,forestsize,tree1,tree2);
    });

    //var txt1 = tree1.substr(0,tree1.length-3) + "txtskl";
    //var txt2 = tree2.substr(0,tree2.length-3) + "txtskl";
    //readFile('../models/AL06a.txtskl');


}
function newtreecircle(content,forestsize,tree1,tree2){
    var treeID = tree1+"_"+tree2;
    var col = -10,row = -10;
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
                        radius: parseFloat(radius),
                        pos: new THREE.Vector3(parseFloat(x), parseFloat(y), parseFloat(z))
                    };
                    branchcircle.push(circle);
                    x = "";
                    y = "";
                    z = "";
                    radius = "";
                }
            }

            draw(treecircle, col, row);
            col++;
            if (col == 5) {
                col = 0;
                row++;
            }
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
var tree = [];
function draw(treecircle,col,row){

    drawTree(treecircle);
    addLeaf(treecircle);
    moveTree(tree, col, row);
    tree = [];
}
//有buffer的老版本drawbranch
var geo = new THREE.BufferGeometry();
function drawBranch(trunk) {
    var seg = 5;
    var vertices = [];
    geo = new THREE.BufferGeometry();
    var _32array = [];
    for(var i = 0, l = trunk.length; i < l-1; i ++){
        var circle = trunk[i];
        for(var s=0;s<seg;s++){//for each point in the circle
            var rd = circle.radius;
            var pos = new THREE.Vector3(0,0,0);
            var posx=0,posy=0,posz=0;
            if(i>0) {
                posx = Math.abs(trunk[i].pos.x - trunk[i - 1].pos.x);
                posy = Math.abs(trunk[i].pos.y - trunk[i - 1].pos.y);
                posz = Math.abs(trunk[i].pos.z - trunk[i - 1].pos.z);
            }
            if(i==0){
                posx = Math.abs(trunk[i+1].pos.x - trunk[i].pos.x);
                posy = Math.abs(trunk[i+1].pos.y - trunk[i].pos.y);
                posz = Math.abs(trunk[i+1].pos.z - trunk[i].pos.z);
            }
            if(posx>=posy&&posx>=posz) {
                pos.x = 0;
                pos.y = rd * Math.sin(2 * Math.PI / seg * s);
                pos.z = rd * Math.cos(2 * Math.PI / seg * s);
            }
            if(posz>=posx&&posz>=posy){
                pos.x = rd * Math.sin(2 * Math.PI / seg * s);
                pos.y = rd * Math.cos(2 * Math.PI / seg * s);
                pos.z = 0;
            }
            if(posy>=posz&&posy>=posx) {
                pos.x = rd * Math.cos(2 * Math.PI / seg * s);
                pos.y = 0;
                pos.z = rd * Math.sin(2 * Math.PI / seg * s);
            }
            vertices.push(pos.add(circle.pos));
        }
    }
    vertices.push(trunk[trunk.length-1].pos);
    _32array = translate(vertices);
    /*    for(i=0;i<l-1;i++){
     for(s=0;s<seg;s++){
     var v1 = i*seg+s;
     var v2 = i*seg+(s+1)%seg;
     var v3 = (i+1)*seg+(s+1)%seg;
     var v4 = (i+1)*seg+s;

     geo.faces.push(new THREE.Face3(v1,v2,v3));
     geo.faceVertexUvs[0].push([new THREE.Vector2(s/seg,0),new THREE.Vector2((s+1)/seg,0),new THREE.Vector2((s+1)/seg,1)]);
     geo.faces.push(new THREE.Face3(v3,v4,v1));
     geo.faceVertexUvs[0].push([new THREE.Vector2((s+1)/seg,1),new THREE.Vector2((s)/seg,1),new THREE.Vector2((s)/seg,0)]);
     }
     }//add faces and uv*/
    geo.addAttribute( 'position', new THREE.Float32BufferAttribute( _32array, 3 ) );
    geo.computeVertexNormals();
    /*    var instancedGeo = new THREE.InstancedBufferGeometry();
     instancedGeo.index = geo.index;
     instancedGeo.attributes = geo.attributes;

     var particleCount = 1;
     var translateArray = new Float32Array( particleCount * 3 );

     for ( var i = 0, i3 = 0, l = particleCount; i < l; i ++, i3 += 3 ) {
     translateArray[ i3 + 0 ] = Math.random() * 10 - 1;
     translateArray[ i3 + 1 ] = Math.random() * 10 - 1;
     translateArray[ i3 + 2 ] = Math.random() * 10 - 1;
     }

     instancedGeo.addAttribute('translate', new THREE.InstancedBufferAttribute( translateArray, 3, 1 ) );
     var shader_material = new THREE.RawShaderMaterial({
     uniforms: {map:{value:branchImg}},
     vertexShader: [
     "precision highp float;",
     "",
     "uniform mat4 modelViewMatrix;",
     "uniform mat4 projectionMatrix;",
     "",
     "attribute vec3 position;",
     "attribute vec3 translate;",
     "",
     "void main() {",
     "",
     "	gl_Position = projectionMatrix * modelViewMatrix * vec4( translate + position, 1.0 );",
     "",
     "}"
     ].join("\n"),
     fragmentShader: [
     "precision highp float;",
     "",
     "void main() {",
     "",
     "	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);",
     "",
     "}"
     ].join("\n"),
     side: THREE.DoubleSide,
     transparent: false,

     });
     branch = new THREE.Mesh(instancedGeo,shader_material);*/
    var branch = new THREE.Mesh(geo,material);
    tree.push(branch);
    //forest.push(branch);
}
//点集转换为32Array
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
//层次结构转换为树
function drawTree(blendtree){
    for(var i=0;i<blendtree.length;i++) {
        drawBranch(blendtree[i]);

    }
}
//添加叶子，先将分层了的tree转变成不分层的数组结构，然后在圆环序列上随机添加叶子
function addLeaf(trunk){

    for(var i = 1;i<trunk.length;i++) {
        for(var j = Math.floor(trunk[i].length/2+Math.floor(Math.random()*4 + 1));j<trunk[i].length;j+=Math.floor(Math.random()*3 + 1)) {
            for (var k = Math.floor(Math.random() * 6 + 1); k < 6; k++) {
                var leaf = new RTLeaf();
                leaf.init();
                leaf.instance(trunk,i,j);
                tree.push(leaf.mesh);
/*                var phi = Math.random() * 60 + 20;
                var theta = Math.random() * 360;
                var selfRotate = Math.random() * 360;
                var leaf_size = 20;

                var geo = new THREE.PlaneBufferGeometry(leaf_size, leaf_size);
                geo.computeVertexNormals();
                var leafMesh = new THREE.Mesh(geo, leafMat);
                leafMesh.geometry.translate(0, leaf_size / 2.0, 0);
                leafMesh.rotateY(theta / 180 * Math.PI);
                leafMesh.rotateZ(phi / 180 * Math.PI);
                leafMesh.rotateY(selfRotate / 180 * Math.PI);
                leafMesh.position.x = trunk[i][j].pos.x;
                leafMesh.position.z = trunk[i][j].pos.z;
                leafMesh.position.y = trunk[i][j].pos.y;
                tree.push(leafMesh);*/
            }
        }
    }
}
function moveTree(tree,x,y){
    for(var i=0; i <tree.length;i++){
        tree[i].position.x -= x*230;
        tree[i].position.z -= y*230;
        scene.add(tree[i]);
    }
}
function RTLeaf() {
    this.parent = null;
    this.tree = null;

    this.size = 1.0;
    this.phi = 0;
    this.theta = 0;
    this.location = 0.5;
    this.selfRotate = 0;

    this.mesh = null;

    this.visible = true;
}
/**
 *
 * @type {{}}
 */
RTLeaf.prototype = {
    update:function () {
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