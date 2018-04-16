/**
 * Created by Kevin on 2017/5/11.
 */
/**
 * construct an LBBs
 * @constructor
 */
function LBBs(){
    this.data = [];
    this.frustumCulled = [];
    this.visible = [];
    this.occlusionCulled = [];
    this.areaThres = 100;
    this.zp = new ZPyramid();
    this.width = this.zp.width;
    this.height = this.zp.height;
    this.zpLevel = this.zp.level;
    this.point = new THREE.Vector3();
}
/**
 *
 * @type {{add: LBBs.add, update: LBBs.update, updateBB: LBBs.updateBB}}
 */
LBBs.prototype = {
    /**
     * add an object wrapped with lbb
     * @param object
     */
    add:function (object) {
        if(object instanceof THREE.Mesh){
            if(!object.geometry.boundingBox){
                object.geometry.computeBoundingBox();
            }
            var max = object.geometry.boundingBox.max.clone();
            var min = object.geometry.boundingBox.min.clone();
            max.applyMatrix4(object.matrixWorld);
            min.applyMatrix4(object.matrixWorld);
            var vertices = [];
            vertices[0] = new THREE.Vector3(min.x,min.y,min.z);//0
            vertices[1] = new THREE.Vector3(max.x,min.y,min.z);//1
            vertices[2] = new THREE.Vector3(max.x,max.y,min.z);//2
            vertices[3] = new THREE.Vector3(min.x,max.y,min.z);//3
            vertices[4] = new THREE.Vector3(min.x,min.y,max.z);//4
            vertices[5] = new THREE.Vector3(max.x,min.y,max.z);//5
            vertices[6] = new THREE.Vector3(max.x,max.y,max.z);//6
            vertices[7] = new THREE.Vector3(min.x,max.y,max.z);//7

            //init lbb
            var lbb = {};
            lbb.object = object;
            lbb.vertices = vertices;
            lbb.bbs = [];
            lbb.depth = 1.0;
            lbb.area = 0;

            //push into visible list default
            this.data.push(lbb);
        }
    },
    depthTest:function (lbb) {
        return this.zp.depthTest(lbb,this.zpLevel - 1);
    },
    /**
     * update visible list
     */
    update:function () {
        var data = this.data,
            frustumCulled = this.frustumCulled,
            occlusionCulled = this.occlusionCulled,
            visible = this.visible;

        var i,len,lbb,res,ind,object;
        //firstly, get camera matrix, assuming camera already update
        
        this.zp.clear();
        var cameraMatrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);

        //zp.clear();//clear depth buffer before depth test
        
        //then update three lists
        visible = [];
        var time1 = Date.now();
        for(i = 0, len = this.data.length;i < len;i ++){
            lbb = data[i];
            res = this.updateBB(lbb,cameraMatrix);
            if(res){
                visible.push(lbb);
            }else{
                lbb.object.visible = false;
                scene.remove(lbb.object.parent);
            }
        }
        
        var time2 = Date.now();
        //console.log("time1:"+(time2-time1));
        visible.sort(function (lbb1, lbb2) {
            return lbb1.depth - lbb2.depth;
        });
        for(i = 0, len = visible.length; i < len; i++){
            lbb = visible[i];
            object = lbb.object;
            res = this.depthTest(lbb);
            if(res){
                object.visible = true;
                scene.add(object.parent);
            }else{
                if(lbb.area > this.areaThres){
                    object.visible = true;
                    scene.add(object.parent);
                }else{
                    object.visible = false;
                    scene.remove(object.parent);
                }

            }
        }
        var time3 = Date.now();
        //console.log("time2:"+(time3 - time2));


    },
    /**
     * update lbb in every frame, with camera matrix
     * return false, if culled by frustum, otherwise return true
     * @param lbb
     * @param cameraMatrix
     * @returns {boolean}
     */
    updateBB:function (lbb,cameraMatrix) {
        var point = this.point,
            level = this.zpLevel,
            width = this.width,
            height = this.height;
        var vertices = lbb.vertices;
        var top,bottom,
            left,right, 
            maxDepth,minDepth;


        point.copy(vertices[0]);
        point.applyMatrix4(cameraMatrix);//project to viewport space
        
        top = bottom = point.y;
        left = right = point.x;
        maxDepth = minDepth = point.z;
        
        for(var i=1,len = vertices.length;i<len;i++){
            
            point.copy(vertices[i]);
            point.applyMatrix4(cameraMatrix);//project to viewport space

            //compute view port space bounding box
            if(point.x > right) right = point.x;
            if(point.x < left) left = point.x;
            if(point.y > bottom) bottom = point.y;
            if(point.y < top) top = point.y;
            if(point.z > maxDepth) maxDepth = point.z;
            if(point.z < minDepth) minDepth = point.z;
        }
        
        //convert to screen space
        right = (1 + right) * width / 2;
        left = (1 + left) * width / 2;
        bottom = (1 - bottom) * height / 2;
        top = (1 - top) * height / 2;
        var temp = top;
        top = bottom;
        bottom = temp;


        lbb.area = (bottom - top + 1) * (right - left + 1);

        //frustum culled
        if(left > width || top > height || right < 0 || bottom < 0 || minDepth > 1.0 || maxDepth < 0 || minDepth < 0 || maxDepth > 1.0)return false;
        
        //shrink to screen border
        if(left < 0)left = 0;
        else left = Math.floor(left);
        if(top < 0)top = 0;
        else top = Math.floor(top);
        if(right > width)right = width - 1;
        if(bottom > height)bottom = height - 1;

        //compute level bounding box
        lbb.bbs[0] = {top:top,bottom:bottom,left:left,right:right};
        for(var lev=1;lev < level;lev++){
            lbb.bbs[lev] = {
                top:Math.floor(lbb.bbs[lev-1].top / 2),
                bottom:Math.floor(lbb.bbs[lev-1].bottom / 2),
                left:Math.floor(lbb.bbs[lev-1].left / 2),
                right:Math.floor(lbb.bbs[lev-1].right / 2)
            };
        }

        lbb.depth = minDepth;

        return true;
    }
};