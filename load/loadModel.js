var branchImg;
var leafImg;
var leafMat;
var material;
var leafMesh;
var LevelDefine = [0,500000,2000000,4000000,5000000,6000000,7000000,8000000,9000000,10000000,15000000,25000000];
var LeavesLevelDefine = [0,10000,250000,1000000];
var instanceBranchSet = [];
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
    return new THREE.Mesh(new THREE.CubeGeometry(25000, 25000, 25000), material);
}
//地面
var planevertices,groud;
function loadGround() {
    //add ground
    var texture2 = THREE.ImageUtils.loadTexture("../textures/terrain/grasslight-big.jpg");
    texture2.wrapS = THREE.RepeatWrapping;
    texture2.wrapT = THREE.RepeatWrapping;
    texture2.repeat.set(100*50/100,100*50/100);
    var plane = new THREE.PlaneBufferGeometry(25000,25000,255,255);
    plane.rotateX(-Math.PI/2);
    planevertices = plane.attributes.position.array;
    var data = generateHeight( 256, 256 );
    for ( var i = 0, j = 0, l = planevertices.length; i < l; i ++, j += 3 ) {

        planevertices[ j + 1 ] = data[ i ] * 10;
    }
    plane.computeVertexNormals();
    groud =  new THREE.Mesh(plane, new THREE.MeshLambertMaterial({
        map: texture2
    }));
    return groud
}
function generateHeight( width, height ) {

    var size = width * height, data = new Uint8Array( size ),
        perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;

    for ( var j = 0; j < 4; j ++ ) {

        for ( var i = 0; i < size; i ++ ) {

            var x = i % width, y = ~~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

        }

        quality *= 5;

    }

    return data;

}
//初始化树木
function initObject(tree1,tree2,forestsize){
    branchImg = new THREE.ImageUtils.loadTexture("../textures/tree/diffuse-min.png");
    leafImg = new THREE.ImageUtils.loadTexture("../textures/tree/leaf01-min.png");
    leafMat = new THREE.MeshLambertMaterial({
        map:leafImg,
        color:0x253F08,
        side:THREE.DoubleSide,
        transparent:true
    });
    material = new THREE.MeshLambertMaterial({
        // wireframe:true,
        side:THREE.DoubleSide,
        map:branchImg
    });
    var leaf_size = 14;
    var geo = new THREE.PlaneGeometry(leaf_size,leaf_size);
    leafMesh = new THREE.Mesh(geo,leafMat);
    leafMesh.geometry.translate(0,leaf_size/2.0,0);

    var i;
    if(tree1 == "AL06a"  && tree2 =="Blue Spruce")
        i=0;
    else if(tree1 == "AL06a"  && tree2 =="BS07a")
        i=6;
    else if(tree1 == "Blue Spruce"  && tree2 =="BS07a")
        i=12;
    for(var j = 0 ;j<forestsize/2500||forestsize/10<250 ; i++,j++) {
        if(forestsize/10 <250){
            $.get("http://127.0.0.1:9091/getTreeModel?pageId=" + i, {}, function (result) {
                newtreecircle(result, forestsize/50, tree1, tree2);
            });
            break;
        }
        else {
            $.get("http://127.0.0.1:9091/getTreeModel?pageId=" + i, {}, function (result) {
                newtreecircle(result, 50, tree1, tree2);
            });
        }
        if(j+1>forestsize/2500-1 && forestsize%2500!=0){
            $.get("http://127.0.0.1:9091/getTreeModel?pageId=" + i+1, {}, function (result) {
                newtreecircle(result, forestsize%2500/50, tree1, tree2);
            });
            break;
        }
    }
}
//从MongoDB中取出过渡树木参数，转换为圆环序列
function newtreecircle(content,forestsize,tree1,tree2){
    planepos = 30;
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
            instanceBranchSet = [];
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
                    var random = Math.floor(Math.random()*5 + 1);
                    circle = {
                        radius: parseFloat(radius/5),
                        pos: new THREE.Vector3(parseFloat(x/5), parseFloat(y/5), parseFloat(z/5))
                    };
                    branchcircle.push(circle);
                    x = "";
                    y = "";
                    z = "";
                    radius = "";
                }
            }

            draw(treecircle);

            //var uniforms = {
            //    map : {value : branchImg}
            //};
            ////uniforms.texture1.value.warpS = uniforms.texture1.value.warpT = THREE.RepeatWrapping;
            //var shader_material = new THREE.RawShaderMaterial({
            //    uniforms: uniforms,
            //    vertexShader: [
            //        "precision highp float;",
            //        "",
            //        "uniform mat4 modelViewMatrix;",
            //        "uniform mat4 projectionMatrix;",
            //        "",
            //        "attribute vec3 position;",
            //        "attribute vec3 translate;",
            //        "varying vec2 vUv;",
            //        "",
            //        "void main() {",
            //        "",
            //        "	gl_Position = projectionMatrix * modelViewMatrix * vec4( translate + position, 1.0 );",
            //        "",
            //        "}"
            //    ].join("\n"),
            //    fragmentShader: [
            //        "precision highp float;",
            //        "",
            //        "varying vec2 vUv;",
            //        "",
            //        "uniform sampler2D texture1;",
            //        "",
            //        "void main(void) {",
            //        "",
            //        "	gl_FragColor = texture2D(texture1, vUv);",
            //        "",
            //        "}"
            //    ].join("\n"),
            //    side: THREE.DoubleSide,
            //    transparent: false
            //
            //});
            //var instencedMesh = new THREE.Mesh(branchesgeo, shader_material);
            //instanceBranchSet.push(instencedMesh);
            //scene.add(instencedMesh);
            //var instencedMesh = new THREE.Mesh(branchesgeo, material);
            //scene.add(instencedMesh);
            //branchesgeo = new THREE.Geometry();

            for(var cl = 0 ;cl<49;cl++) {
                //buffer版本
                //var temp = [];
                //for (var j = 0; j < instanceBranchSet.length; j++) {
                //    temp.push(instanceBranchSet[j].clone());
                //}
                //temp.push(tree[tree.length-1].clone());
                //temp[temp.length-1].position.x -=tree[0].position.x;
                //temp[temp.length-1].position.y -=tree[0].position.y;
                //temp[temp.length-1].position.z -=tree[0].position.z;
                //forest.push(temp);
                //moveTree(temp);
                //planepos+=30 * Math.floor(Math.random() * 6 + 1);

                //geometry版本
                var temp = [];
                for (var j = 0; j < tree.length; j++) {
                    temp.push(tree[j].clone());
                    temp[j].position.x -=tree[0].position.x;
                    temp[j].position.y -=tree[0].position.y;
                    temp[j].position.z -=tree[0].position.z;
                }
                forest.push(temp);
                moveTree(temp);
                planepos+=30 * Math.floor(Math.random() * 12 + 1);
            }
            tree = [];
        }
        forestupdate();
    }
}
//将圆环序列还原成树
var tree = [];
function draw(treecircle){
    branchesgeo = new THREE.Geometry();
    drawTree(treecircle);
    addLeaf(treecircle);

    //branches为一棵树所有枝干merge后的
    var branches = new THREE.Mesh(branchesgeo,material);
    //branches.updateMatrix();
    ////treegeo为一棵树的geometry
    //var treegeo = new THREE.Geometry();
    //treegeo.merge(branches.geometry,branches.matrix);
    //treegeo.merge(leaves.geometry,leaves.matrix);
    ////leafMat为叶子的material branches.material为枝干的material
    //var materials = [leafMat,branches.material];
    //var treematerial = new THREE.MeshFaceMaterial(materials);
    //var comTree = new THREE.Mesh(treegeo,treematerial);
    //console.log(comTree);
    var randomy =  Math.random() * 6 + 1;
    var randomsize = Math.random()*2 + 1;
    branches.scale.set(randomy/randomsize,randomy,randomy/randomsize);
    leaves.scale.set(randomy/randomsize,randomy,randomy/randomsize);
    tree.push(branches);

    tree[0].maintrunk = true;
    tree[0].childs = [];
    for(var i = 1;i<tree.length;i++){
        tree[0].childs.push(tree[i]);
    }
    moveTree(tree);
    planepos+=30 * Math.floor(Math.random() * 18 + 1);
    forest.push(tree);
}
//有buffer的老版本drawbranch，绘制每一个branch
var geo = new THREE.BufferGeometry();
var branchesgeo = new THREE.Geometry();
/**
 * @return {boolean}
 */
function None(element, index, array){
    return !isNaN(element);
}
function drawBranch(trunk) {

    var seg = 3 ;
    var vertices = [];
    var _32array = [];
    geo = new THREE.Geometry();
    for (var i = 0, l = trunk.length; i < l - 1; i++) {
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
            geo.vertices.push(pos.add(circle.pos));
        }
    }
    //vertices.push(trunk[trunk.length - 1].pos);
    //_32array = translate(vertices, seg);
    //
    ////geometry版本
    //for(var i = 0;i<_32array.length;i+=3){
    //    geo.vertices.push(
    //       new THREE.Vector3( _32array[i],_32array[i+1],_32array[i+2])
    //    );
    //}
    for(i=0;i<l-1;i++){
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
    }//add faces and uv
    //geo.computeFaceNormals();

    var branch = new THREE.Mesh(geo,material);
    branch.updateMatrix();
    branchesgeo.merge(branch.geometry,branch.matrix);


    //buffergeometry版本
    //geo.addAttribute('position', new THREE.Float32BufferAttribute(_32array, 3));
    //geo.computeVertexNormals();
    //var particleCount = 1;
    //var translateArray = new Float32Array( particleCount * 3 );
    //for ( var i = 0, i3 = 0, l = particleCount; i < l; i ++, i3 += 3 ) {
    //    translateArray[ i3 ] = 0;
    //    translateArray[ i3 + 1 ] = 0;
    //    translateArray[ i3 + 2 ] = 0;
    //}
    //var instancedGeo = new THREE.InstancedBufferGeometry();
    //instancedGeo.index = geo.index;
    //instancedGeo.attributes = geo.attributes;
    //instancedGeo.addAttribute('translate', new THREE.InstancedBufferAttribute( translateArray, 3, 1 ) );
    //
    //
    //var uniforms = {
    //    map : {value : branchImg}
    //};
    //var shader_material = new THREE.RawShaderMaterial({
    //    uniforms: uniforms,
    //    vertexShader: [
    //        "precision highp float;",
    //        "",
    //        "uniform mat4 modelViewMatrix;",
    //        "uniform mat4 projectionMatrix;",
    //        "",
    //        "attribute vec3 position;",
    //        "attribute vec3 translate;",
    //        "varying vec2 vUv;",
    //        "",
    //        "void main() {",
    //        "",
    //        "	gl_Position = projectionMatrix * modelViewMatrix * vec4( translate + position, 1.0 );",
    //        "",
    //        "}"
    //    ].join("\n"),
    //    fragmentShader: [
    //        "precision highp float;",
    //        "",
    //        "varying vec2 vUv;",
    //        "",
    //        "uniform sampler2D texture1;",
    //        "",
    //        "void main(void) {",
    //        "",
    //        "	gl_FragColor = texture2D(texture1, vUv);",
    //        "",
    //        "}"
    //    ].join("\n"),
    //    side: THREE.DoubleSide,
    //    transparent: false
    //
    //});
    //var instencedMesh = new THREE.Mesh(instancedGeo, shader_material);
    //instanceBranchSet.push(instencedMesh);
    //
    ////merge
    ////geo.attributes.normal.array.filter(None);
    ////geo.addAttribute('normal', new THREE.BufferAttribute(geo.attributes.normal.array.filter(None), 3));
    ////geo.attributes.normal.array[geo.attributes.normal.array.length - 1] = 0;
    ////geo.attributes.normal.array[geo.attributes.normal.array.length - 2] = 0;
    ////geo.attributes.normal.array[geo.attributes.normal.array.length - 3] = 0;
    //var branch = new THREE.Mesh(geo, material);
    //branch.updateMatrix();
    //
    //console.log(branch.geometry);
    //var branchgeo = new THREE.Geometry().fromBufferGeometry(branch.geometry);
    //branchesgeo.merge(branchgeo ,branch.matrix);
    //tree.push(branch);
}
//点集转换为32Array，用于BufferGeometry的position属性
function translate(vertices,precision){
    var _32array = [];
    for(var i=0;i<vertices.length;i++){
        if(i + 1 == vertices.length-1){
            _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
            _32array.push(vertices[i- precision +1].x, vertices[i- precision +1].y, vertices[i- precision +1].z);
            _32array.push(vertices[vertices.length-1].x, vertices[vertices.length-1].y, vertices[vertices.length-1].z);
        }
        else if(i == vertices.length-1){
            _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
        }
        else if((i+1) %precision == 0 && i + 1 != vertices.length-1){
            _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
            _32array.push(vertices[i - precision +1].x, vertices[i - precision +1].y, vertices[i - precision +1].z);
            _32array.push(vertices[i + precision].x, vertices[i + precision].y, vertices[i + precision].z);
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
    for(var j = vertices.length-2; j>=precision;j--){
        if(j % precision ==0){
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
var leafgeo = new THREE.Geometry();
var leaves;
function addLeaf(trunk){
    leafgeo = new THREE.Geometry();
    for(var i = 1;i<trunk.length;i++) {
        for(var j = Math.floor(trunk[i].length/2+Math.floor(Math.random()*4 + 1));j<trunk[i].length;j+=Math.floor(Math.random()*3 + 1)) {
            for (var k = Math.floor(Math.random() * 6 + 1); k < 4; k++) {
                var leaf = leafMesh.clone();
                var phi = Math.random()*60+20;
                var theta = Math.random()*360;
                var selfRotate = Math.random()*360;
                leaf.rotateY(theta/180*Math.PI);
                leaf.rotateZ(phi/180*Math.PI);
                leaf.rotateY(selfRotate/180*Math.PI);
                leaf.position.x = trunk[i][j].pos.x;
                leaf.position.z = trunk[i][j].pos.z;
                leaf.position.y = trunk[i][j].pos.y;
                leaf.updateMatrix();
                leafgeo.merge(leaf.geometry,leaf.matrix);
                //tree.push(leaf);
                //forest.push(leaf.mesh);
                //leaves.push(leaf);
                //lbbs.add(leaf);
            }
        }
    }
    leaves = new THREE.Mesh(leafgeo,leafMesh.material);
    tree.push(leaves);
}
//修改树木的位置
var planepos = 30;
function moveTree(trees){
    for(var i=0; i <trees.length;i++){
        trees[i].position.x += planevertices[planepos];
        trees[i].position.z += planevertices[planepos+2];
        trees[i].position.y += planevertices[planepos+1];
        scene.add(trees[i]);
    }
}