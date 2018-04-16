/**
 * Created by Kevin on 2017/5/5.
 */
function ZPyramid(){
    this.width = 256;//256
    this.height = 256;//256
    this.data = [];
    this.size = [];
    this.level = 1;
    this.init();
}

ZPyramid.FARTHEST = 1.0;
ZPyramid.NEAREST = 0.0;

ZPyramid.prototype = {
    init:function () {
        var width = this.width;
        var height = this.height;
        var data = this.data;
        while(width >= 1){
            this.size.push({width:width,height:height});
            width = width / 2;
            height = height / 2;
        }
        this.level = this.size.length;
        for(var lev = 0, ll = this.size.length;lev < ll;lev += 1){
            data[lev] = new Float32Array(this.size[lev].width * this.size[lev].height);
            for(var i=0,l=data[lev].length;i < l;i += 1){
                data[lev][i] = 1.0;
            }
        }
    },
    depthTest:function (lbb,level,x,y) {
        x = x || 0;
        y = y || 0;
        //if pixel (x,y,level) inside lbb
        if(x <= lbb.bbs[level].right && x >= lbb.bbs[level].left && y <= lbb.bbs[level].bottom && y >= lbb.bbs[level].top){
            var ind = y * this.size[level].width + x;
            if(lbb.depth > this.data[level][ind]){
                return false;//if lbb occluded in this pixel, return false
            }else if(level > 0){//else, go to four sub pixels in next level
                //if depth test fail in all four sub pixels, then return false, otherwise return true
                var test1 = this.depthTest(lbb,level-1,x*2,y*2),
                    test2 = this.depthTest(lbb,level-1,x*2+1,y*2),
                    test3 = this.depthTest(lbb,level-1,x*2,y*2+1),
                    test4 = this.depthTest(lbb,level-1,x*2+1,y*2+1);
                
                return test1 || test2 || test3 || test4;
            }else if(level == 0){
                //when reach the last level,write pixel and return true
                this.writePixel(x,y,lbb.depth);
                return true;
            }
            return false;
        }else{
            return false;
        }
        
    },
    getInd:function (bb, level) {
        //
    },
    writePixel:function (x, y, value) {
        var data = this.data;
        var width = this.width;
        var ind = y * width + x;
        if(data[0][ind] <= value)return false;
        data[0][ind] = value;
        var a,b,c,d;
        for(var lev = 0,ll = this.size.length - 1;lev < ll;lev += 1){
            x = Math.floor(x / 2);
            y = Math.floor(y / 2);
            ind = 2 * y * width + 2 * x;//left-top corner
            a = data[lev][ind];
            b = data[lev][ind + 1] || 0;
            c = data[lev][ind + width] || 0;
            d = data[lev][ind + width + 1] || 0;
            a = a > b ? a : b;
            c = c > d ? c : d;
            a = a > c ? a : c;


            width = this.size[lev + 1].width;
            ind = y * width + x;
            if(data[lev + 1][ind] == a)break;//no influence in this level, so stop propagating value
            data[lev + 1][ind] = a;

        }
    },
    clear:function () {
        for(var lev = 0, ll = this.size.length;lev < ll;lev += 1){
            for(var i=0,l=this.data[lev].length;i < l;i += 1){
                this.data[lev][i] = 1.0;
            }
        }
    },
    depthTest1:function (node) {
        var vertices = [];
        var xmin = node.left;
        var xmax = node.right;
        var ymin = node.bottom;
        var ymax = node.top;
        var zmin = node.back;
        var zmax = node.front;
        vertices.push(new THREE.Vector3(xmin, ymin, zmin));
        vertices.push(new THREE.Vector3(xmax, ymin, zmin));
        vertices.push(new THREE.Vector3(xmin, ymax, zmin));
        vertices.push(new THREE.Vector3(xmax, ymax, zmin));
        vertices.push(new THREE.Vector3(xmin, ymin, zmax));
        vertices.push(new THREE.Vector3(xmax, ymin, zmax));
        vertices.push(new THREE.Vector3(xmin, ymax, zmax));
        vertices.push(new THREE.Vector3(xmax, ymax, zmax));

        //convert world position to screen position
        var matrix = new THREE.Matrix4();
        camera.updateMatrixWorld();
        matrix.multiplyMatrices( this.camera.projectionMatrix, matrix.getInverse( this.camera.matrixWorld ) );

        var bb = {top:height,bottom:0,left:width,right:0};
        var minDepth=ZPyramid.FARTHEST,
            maxDepth = ZPyramid.NEAREST,
            vector,
            x,y;
        var halfWidth = this.width / 2;
        var halfHeight = this.height / 2;

        for(var i=0,il=vertices.length;i<il;i++){
            vertices[i].applyMatrix4(matrix);//convert coordinate system
            vector = vertices[i];
            minDepth = vector.z < minDepth ? vector.z : minDepth;//get min depth
            maxDepth = vector.z > maxDepth ? vector.z : maxDepth;
            x = Math.round(vector.x * halfWidth + halfWidth);//convert to screen position
            y = Math.round(-vector.y * halfHeight + halfHeight);

            //generate bounding box
            if(y < bb.top) bb.top = y;
            if(y > bb.bottom) bb.bottom = y;
            if(x < bb.left) bb.left = x;
            if(x > bb.right) bb.right = x;
        }

        if(minDepth >= 1.0 )return true;
        if(bb.left < 0 || bb.right > this.width || bb.top < 0 || bb.bottom > this.height)return false;
        if(bb.left > this.width || this.right < 0 || this.top > this.height || this.bottom < 0 )return true;//view frustum culling
        //generate level bounding box
        var lbb = [];
        lbb[0] = {
            top:Math.max(0,Math.floor(bb.top )),
            bottom:Math.min(this.size[0].height,Math.floor(bb.bottom )),
            left:Math.max(0,Math.floor(bb.left )),
            right:Math.min(this.size[0].width,Math.floor(bb.right ))
        };
        for(var lev=1;lev < this.level;lev++){
            lbb[lev] = {
                top:Math.max(0,Math.floor(lbb[lev-1].top / 2)),
                bottom:Math.min(this.size[lev].height,Math.floor(lbb[lev-1].bottom / 2)),
                left:Math.max(0,Math.floor(lbb[lev-1].left / 2)),
                right:Math.min(this.size[lev].width,Math.floor(lbb[lev-1].right / 2))
            };
        }
        return this.depthTestBB(lbb,minDepth);
    },
    depthTestBB:function (lbb, minDepth) {
        var width;
        for(var lev=this.level-1;lev >= 3;lev--){
            width = this.size[lev].width;
            var bb = lbb[lev];
            var flag = true;
            for(var i=bb.top;i<=bb.bottom&&flag;i++){
                for(var j=bb.left;j<=bb.right&&flag;j++){
                    if(this.data[lev][i*width+j] >= minDepth && this.data[lev][i*width+j]){
                        flag = false;//depth test fail, go to the next level
                        break;
                    }
                }
            }
            if(flag)return true;//depth test success, the node is hidden, return true
        }
        return false;//in default case, the node is not hidden
    }
};