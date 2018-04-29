# LoadTree
Generate blending tree files through SB-Tree, and store these files into MongoDB, and then restore blending trees through this program. It can save a lot of calculation from the front-end compared to SB-Tree.

## 2018/4/27更新
>目前项目处于论文阶段，下一步与地形编辑项目进行结合。该项目目前最多加载2000棵树木，FPS会下降到5左右，界面出现卡顿，使用了随机剔除算法。LOD有待进一步验证是否有用，因为LOD虽然减小了渲染的精度，但树木精度已经降得很低，而且LOD还增加了数据量。
>如果要进一步优化的话，可以使用‘广告牌’的功能，即远处看只是一张贴图，近距离看则提高物体的精度。

>太懒了，就写到这里了，下面是技术路线。

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
