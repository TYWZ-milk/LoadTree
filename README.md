# LoadTree
Generate blending tree files through SB-Tree, and store these files into MongoDB, and then restore blending trees through this program. It can save a lot of calculation from the front-end compared to SB-Tree.

## 2018/4/27 update
>Currently the project is in the paper stage and the next step is to combine it with the terrain editing project. The project currently loads up to 2,000 trees, FPS will drop to around 5, and the interface appears to be stuck, using a random culling algorithm. The LOD needs further validation to be useful, because LOD reduces the precision of rendering, but the tree accuracy has dropped very low, and LOD has increased the amount of data.
>If you want to further optimize, you can use the function of 'billboard', that is, just look at a map in the distance, and improve the accuracy of the object when viewed from a close distance.


![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result1.png)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result2.png)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result3.png)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result4.jpg)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result5.png)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result6.png)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result7.png)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result8.png)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result9.jpg)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result10.png)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result11.jpg)
![](https://github.com/TYWZ-milk/LoadTree/raw/master/ReadMe/result12.jpg)
