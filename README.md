# 圣诞节！头像大作战！

今天我们来手把手教你实现一个超简版圣诞帽头像生成器。


## 实现功能思路：

1、将预览图片、帽子放在一个地方avatar元素里

2、选择图片 -> 展示图片预览

3、实现帽子功能：拖拽、旋转、缩放

4、用一个js库（html2canvas.js）将avatar整个截下来成一个canvas，将截下来的canvas的图片数据赋给img标签，展示出来

5、完成基本功能后，完善其他小功能，如：切换帽子、切换图片修改区/完成区

## html + css
```html
<!DOCTYPE html>
<body lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>头像大作战</title>
    <style>
        body {
            background: #000 url(./img/bg.png) no-repeat center;
            text-align: center;
            user-select: none;
        }
        /* 设置button的一点样式 */
        button {
            background-color: #fff;
            border: none;
            padding: 5px 10px;
            box-shadow: 0 0 10px 0 #ccc;
        }
        /* 修改图片区域 */
        #modify-area {
            display: block;
            margin-top: 100px;
        }
        #modify-area.hide {
            /* 隐藏  修改图片区域 */
            display: none;
        }
        /* 存放预览图片、帽子的父元素 */
        #avatar {
            width: 300px;
            height: 300px;
            position: relative;
            margin: auto;
            overflow: hidden;
        }
        #avatar #avatar_img {
            width: 300px;
            height: 300px;
        }
        #avatar #avatar_template {
            width: 100%;
            height: 100%;
        }
        #hatBox {
            width: 100px;
            position: absolute;
        }
        #hatBox #rotateImg {
            display: none;
            position: absolute;
            left: 50%;
            margin-left: -10px;
            top: -30px;
            width: 20px;
            height: 20px;
            background-image: url('./img/rotate.png');
            background-size: 100% 100%;
        }
        #hatBox #rotateImg.active {
            /* 展示  旋转图标 */
            display: block;
        }
        #hatBox #spreadImg {
            display: none;
            position: absolute;
            right: -10px;
            top: calc(100% - 10px);
            width: 20px;
            height: 20px;
            background-image: url('./img/spread.png');
            background-size: 100% 100%;
        }
        #hatBox #spreadImg.active {
            /* 展示  缩放图标 */
            display: block;
        }
        /* 最后图片区域 */
        #result-area {
            display: none;
        }
        #result-area.active {
            /* 展示   最后图片区域 */
            display: block;
        }
        #result-img {
            width: 300px;
            height: 300px;
        }
        #tips {
            color: #fff;
            font-size: 20px;
        }
    </style>
</head>

<body>
    <header>
        <h1>头像大作战</h1>
    </header>
    <article>
        <section>
            <p>
                <!--accept 限制了只能选择图片-->
                <input type="file" name="" id="upload" accept="image/*" onchange="loadImage()">
            </p>
        </section>
        <!-- 修改图片区域 -->
        <section id="modify-area">
            <div id="avatar">
                <!-- <img src="../hat.png" alt="0" id="avatar_template"> -->
                <div id="hatBox">
                    <img src="./cap/01.png" alt="1" id="avatar_template" draggable="false">
                    <span id="rotateImg"></span>
                    <span id="spreadImg"></span>
                </div>
                <!-- avatar_img是预览图片 -->
                <img src="" alt="" id="avatar_img" draggable="false">
            </div>
            <p>
                <button id="prev" onclick="prevTemplate()">上一个</button>
                <button id="download" onclick="downloadImage()">下载</button>
                <button id="next" onclick="nextTemplate()">下一个</button>
            </p>
        </section>
        <!-- 图片完成区域 -->
        <section id="result-area">
            <!-- result-img是完成后展示的图片 -->
            <img src="" alt="" id="result-img">
            <p id="tips">
                长按保存图片！
            </p>
        </section>
    </article>
    <footer>
        <script>...</script>
    </footer>
</body>
</html>
```
## 定义的一些全局变量
```javascript
let avatar = document.getElementById('avatar');
let tempImg = document.getElementById('avatar_template');//帽子img元素
let avatarLeft = avatar.offsetLeft;//预览图片距离html页面的left值
let avatarTop = avatar.offsetTop;//预览图片距离html页面的top值
let hatBox = document.getElementById('hatBox');//帽子的父级hatBox
let rotateImg = document.getElementById('rotateImg');//旋转图片
let spreadImg = document.getElementById('spreadImg');//拉伸图标
//全局下保存原来帽子的尺寸
let originHatSize = { w: hatBox.offsetWidth, h: hatBox.offsetHeight };
//拉伸帽子时，先记下比例，防止帽子变形
let hatSizeRate = originHatSize.w / originHatSize.h;
```
## 选择图片 -> 展示图片预览

`<input type="file" name="" id="upload" accept="image/*" `
`onchange="loadImage()">`
```javascript
function loadImage() {
    /*创建文件读取对象*/
    let file = new FileReader();
    /*读取文件*/
    file.readAsDataURL(document.getElementById('upload').files[0]);
    /*读取完后，对象本身的result属性就是最后的链接*/
    file.onload = function (params) {
        document.getElementById('avatar_img').src = file.result;
    }
}
```
## 实现帽子功能
### 1、拖拽帽子
#### 给帽子父级hatBox绑定鼠标点击/触摸事件
- 实现拖拽帽子思路：已知鼠标第一次点的时候的坐标(originX,originY)，已知每次帽子距离左上角距离预览图片左上角的距离(inX,inY)，已知预览图片左上角在html页面距左上(imgX,imgY)，（假设以预览图片左上角为中心）可以算出刚开始鼠标点击时，鼠标距离帽子左上（disX，disY），然后假设每次移动鼠标的坐标（nowX,nowY）
可以计算出以预览图片左上角为中心，帽子的left，top值

disX = originX - imgX - inX

disY = originY - imgY - inY

left = (nowX - disX) - imgX

top = (nowY - disY) - imgY
![](./images/1.jpg)
```javascript
let hatBox = document.getElementById('hatBox');
hatBox.onmousedown = dragHatStart;
hatBox.ontouchstart = dragHatStart;

function dragHatStart(e) {
    hatBox.style.border = '1px dotted #eef';//显示帽子白色边框
    rotateImg.classList.add('active');//展示旋转图标
    spreadImg.classList.add('active');//展示缩放图标

    /*兼容pc端和移动端的点击坐标*/
    let clientObj = {};
    if (e.targetTouches) {
        clientObj.clientX = e.targetTouches[0].pageX;
        clientObj.clientY = e.targetTouches[0].pageY;
    } else {
        clientObj.clientX = e.clientX;
        clientObj.clientY = e.clientY;
    }

    /*disX：点击帽子时，点击坐标距离帽子图标最左端的距离
    * disY：点击帽子时，点击坐标距离帽子图标最上边的距离
    */
    let disX = clientObj.clientX - avatarLefthatBox.offsetLeft;
    let disY = clientObj.clientY - avatarTophatBox.offsetTo
    
    /*兼容pc端*/
    document.onmousemove = dragHatMove;//实现拖拽
    document.onmouseup = dragHatEnd;//不拖拽时要处理的程序

    /*兼容移动端*/
    document.ontouchmove = dragHatMove;
    document.ontouchend = dragHatEnd;


    /*给document绑定的mousemove事件处理程序*/
    function dragHatMove(e) {
        /*兼容移动端和pc端的点击的坐标点*/
        let clientObj = {};
        if (e.targetTouches) {
            clientObj.clientX = e.targetTouches.pageX;
            clientObj.clientY = e.targetTouches.pageY;
        } else {
            clientObj.clientX = e.clientX;
            clientObj.clientY = e.clientY;
        }
        /*newLeft: 帽子距离预览图片最左端的距离
        * newTop: 帽子距离预览图片最上边的距离
        */
        let newLeft = clientObj.clientX - avatarLe- disX;
        let newTop = clientObj.clientY - avatarTopdisY;

        /*maxLeft: 最大能移动帽子的left值
        *....
        */
        let maxLeft = avatar.offsetWidthhatBox.offsetWidth / 2;
        let minLeft = -hatBox.offsetWidth / 2;
        let maxTop = avatar.offsetHeighthatBox.offsetHeight / 2;
        let minTop = -hatBox.offsetHeight / 2;

        /*对移动过程中每次的left和top值和最大最小值进行比较*/
        if (newLeft >= maxLeft) {
            newLeft = maxLeft;
        }
        if (newLeft <= minLeft) {
            newLeft = minLeft;
        }
        if (newTop >= maxTop) {
            newTop = maxTop;
        }
        if (newTop <= minTop) {
            newTop = minTop;
        }
        
        /*将计算好的newLeft、newTop赋予hatBox，实现拖拽功能*/
        hatBox.style.left = newLeft + 'px';
        hatBox.style.top = newTop + 'px';
    }

    /*给document绑定的mouseup事件处理程序*/
    function dragHatEnd(e) {
        document.onmousemove = null;//取消move事件，不然还会跟着鼠标走
        document.ontouchend = null;//兼容移动端
    }
    
};
```
### 2、旋转帽子(给旋转图标绑定事件)
- 旋转帽子思路：可以计算出当前帽子最中心的点在html页面里的坐标(capX,capY)，假设每次鼠标在html页面坐标是(tempX, tempY)，就可以求出旋转的角度deg

deg = Math.atan2(tempX - capX,tempY - capY) / Math.PI * 180 + 90
```javascript
rotateImg.onmousedown = rotateStart;
rotateImg.ontouchstart = rotateStart;
function rotateStart(e) {
    /*curOffsetX：帽子中心在html页面里的x坐标
    *curOffsetY：帽子中心在html页面里的y坐标
    */
    let curOffsetX = avatarLeft + hatBox.offsetLeft + tempImg.offsetWidth / 2;
    let curOffsetY = avatarTop + hatBox.offsetTop + tempImg.offsetHeight / 2;
    document.onmousemove = roteteMove;
    document.onmouseup = rotateEnd;
    document.ontouchmove = roteteMove;
    document.ontouchend = rotateEnd;

    e.stopPropagation();//防止冒泡

    function rotateEnd(e) {
        document.onmousemove = null;
        document.ontouchmove = null;
    }
    function roteteMove(e) {
        let clientObj = {};
        if (e.targetTouches) {
            clientObj.clientX = e.targetTouches[0].pageX;
            clientObj.clientY = e.targetTouches[0].pageY;
        } else {
            clientObj.clientX = e.clientX;
            clientObj.clientY = e.clientY;
        }
        //result：计算图片旋转的角度
        let result = Math.atan2(clientObj.clientY - curOffsetY, clientObj.clientX - curOffsetX) / Math.PI * 180 + 90;
       
        //通过修改css属性transform:rotate来改变帽子的旋转角度
        hatBox.style.transform = 'rotate(' + result + 'deg)';
    }

}
```
### 3、缩放帽子(给缩放图标绑定事件)
- 缩放帽子实现思路：已知当前帽子的宽度，长度，和帽子的比例，又因为可以计算出帽子右下角在html页面的坐标，也知道当前鼠标的坐标，可以求出帽子增大了多少宽度，然后因为知道帽子比例，也就可以求出高度
```javascript
//全局下保存原来帽子的尺寸
let originHatSize = { w: hatBox.offsetWidth, h: hatBox.offsetHeight };
//全局下保存原来帽子的比例，防止缩放时图片变形
let hatSizeRate = originHatSize.w / originHatSize.h;//拉伸帽子时，先记下比例，防止帽子变形

spreadImg.onmousedown = spreadStart;
spreadImg.ontouchstart = spreadStart;
    
function spreadStart(e) {
    /*保存最初点击时的坐标点*/
    let originDot = {};
    if (e.targetTouches) {
        originDot.clientX = e.targetTouches[0].pageX;
        originDot.clientY = e.targetTouches[0].pageY;
    } else {
        originDot.clientX = e.clientX;
        originDot.clientY = e.clientY;
    }
    document.onmousemove = spreadMove;
    document.ontouchmove = spreadMove;
    document.onmouseup = function (e) {
        /*当松开鼠标时要同步修改全局里保存的帽子尺寸*/
        originHatSize.w = hatBox.offsetWidth;
        originHatSize.h = hatBox.offsetHeight;
        document.onmousemove = null;
    }
    document.ontouchend = function (e) {
        originHatSize.w = hatBox.offsetWidth;
        originHatSize.h = hatBox.offsetHeight;
        document.onmousemove = null;
    }

    e.stopPropagation();//取消冒泡，防止drag事件的影响

    function spreadMove(e) {
        let curDot = {};
        if (e.targetTouches) {
            curDot.clientX = e.targetTouches[0].pageX;
            curDot.clientY = e.targetTouches[0].pageY;
        } else {
            curDot.clientX = e.clientX;
            curDot.clientY = e.clientY;
        }
        //spreadWidth：计算出横向上放大的距离
        let spreadWidth = curDot.clientX - originDot.clientX;
        //将spreadWidth加上全局保存的原来的帽子的宽度，得出最新的帽子的宽度
        hatBox.style.width = originHatSize.w + spreadWidth + 'px';
        //知道图片比例和图片宽度，可以算出图片高度
        hatBox.style.height = (hatBox.offsetWidth) / hatSizeRate + 'px';
    }
}
```


## 将avatar截下来
### 1、在该js文件前引入html2canvas.js文件
```javascript
`<script src="./html2canvas.js"></script>`
`<script>/*我们刚刚写的那些代码....*/</script>`
```
### 2、给下载的按钮绑定点击事件
`<button id="download" onclick="downloadImage()">下载</button>`
```javascript
function downloadImage() {
    hatBox.style.border = 'none';//去除hatBox的白色边框
    rotateImg.classList.remove('active');//隐藏旋转图标
    spreadImg.classList.remove('active');//隐藏缩放图标
    
    /* 使用html2canvas.js里的方法
    * 语法：html2canvas(element).then(function(canvas){
    *    console.log(canvas);//这里的canvas就是截图成功后返回的canvas
    })
    */
    html2canvas(document.getElementById('avatar')).then(function (canvas) {
        //获取canvas的链接
        resultImageUrl = canvas.toDataURL("image/png");
        //将该链接赋值给展示结果里的img元素
        let resultImg = document.getElementById('result-img');
        resultImg.src = resultImageUrl;
        resultImg.onload = function () {
            //这里判断top值只是让每次下载完后，帽子都回去一个正常的top值，可有可无
            if (hatBox.offsetTop < 0) {
                hatBox.style.top = 0;
            }
            // 创建一个 a 标签，设置 download 属性，点击时下载文件
            var save_link = document.createElement('a');
            save_link.href = resultImageUrl;//设置下载的链接
            save_link.download = 'avatar.png';//设置下载的图片名称
            save_link.click();//通过方法手动触发点击

            showResult(true);//切换是否完成图片下载，该函数在下边
        }
    });
}
```
## 切换图片修改区modify-area和图片完成区result-area
### 全局下定义一个showResult函数，去切换
```javascript
function showResult(status) {
    if (status) {
        //展示图片完成区，隐藏修改区
        document.getElementById('modify-area').classList.add('hide');
        document.getElementById('result-area').classList.add('active');
    } else {
        //隐藏图片完成区，展示修改区
        document.getElementById('modify-area').classList.remove('hide');
        document.getElementById('result-area').classList.remove('active');
    }
}
```
## 切换不同帽子
### 1、给上一页，下一页按钮绑定事件

`<button id="prev" onclick="prevTemplate()">上一个</button>`

`<button id="next" onclick="nextTemplate()">下一个</button>`
```javascript
function prevTemplate() {
    var current = parseInt(document.getElementById('avatar_template').alt);
    //img文件夹里是01.png - 40.png
    //current：通过这一次的帽子img元素里的alt值计算出前一个帽子的索引
    current = (current - 1 + 40) % 41;
    if (current === 0) {
        current = 1;
    }
    //将前一个帽子的作为新的帽子
    document.getElementById('avatar_template').src = './cap/' + (current < 10 ? '0' + current : current) + '.png';
    //同步修改alt值，因为current是通过alt值来定位的
    document.getElementById('avatar_template').alt = current;
}

/*解释同理上边*/
function nextTemplate() {
    var current = parseInt(document.getElementById('avatar_template').alt);
    current = (current + 1) % 41;
    if (current === 0) {
        current = 1;
    }
    document.getElementById('avatar_template').src = './cap/' + (current < 10 ? ('0' + current) : current) + '.png';
    document.getElementById('avatar_template').alt = current;
}
```

最后成品（https://szisa.github.io/avatar_maker/sample.html）：

![](./images/result.gif)

完整代码可以来这看哦：https://github.com/szisa/avatar_maker/blob/master/sample.html# christmas
