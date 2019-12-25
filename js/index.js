
let avatar = document.getElementById('avatar');
let tempImg = document.getElementById('avatar_template');
let avatarLeft = avatar.offsetLeft;
let avatarTop = avatar.offsetTop;
let hatBox = document.getElementById('hatBox');
let curX = 0, curY = 0;
let rotateImg = document.getElementById('rotateImg');//旋转图片
let spreadImg = document.getElementById('spreadImg');//拉伸图标

let originHatSize = { w: hatBox.offsetWidth, h: hatBox.offsetHeight };


let hatSizeRate = originHatSize.w / originHatSize.h;//拉伸帽子时，先记下比例，防止帽子变形
bindEvent();

/* 绑定事件 */
function bindEvent() {
    hatBox.onmousedown = dragHatStart;
    rotateImg.onmousedown = rotateStart;
    spreadImg.onmousedown = spreadStart;

    hatBox.ontouchstart = dragHatStart;
    rotateImg.ontouchstart = rotateStart;
    spreadImg.ontouchstart = spreadStart;


}

function spreadStart(e) {

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
        let spreadWidth = curDot.clientX - originDot.clientX;

        hatBox.style.width = originHatSize.w + spreadWidth + 'px';
        hatBox.style.height = (hatBox.offsetWidth) / hatSizeRate + 'px';
    }
}

function rotateStart(e) {
    let curOffsetX = avatarLeft + hatBox.offsetLeft + tempImg.offsetWidth / 2;
    let curOffsetY = avatarTop + hatBox.offsetTop + tempImg.offsetHeight / 2;
    document.onmousemove = roteteMove;
    document.onmouseup = rotateEnd;
    document.ontouchmove = roteteMove;
    document.ontouchend = rotateEnd;
    e.stopPropagation()
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
        let result = Math.atan2(clientObj.clientY - curOffsetY, clientObj.clientX - curOffsetX) / Math.PI * 180 + 90;
        hatBox.style.transform = 'rotate(' + result + 'deg)';
    }

}
function dragHatStart(e) {
    hatBox.style.border = '1px dotted #eef';
    rotateImg.classList.add('active');
    spreadImg.classList.add('active');

    let clientObj = {};
    if (e.targetTouches) {
        clientObj.clientX = e.targetTouches[0].pageX;
        clientObj.clientY = e.targetTouches[0].pageY;
    } else {
        clientObj.clientX = e.clientX;
        clientObj.clientY = e.clientY;
    }
    let disX = clientObj.clientX - avatarLeft - hatBox.offsetLeft;
    let disY = clientObj.clientY - avatarTop - hatBox.offsetTop;

    document.onmousemove = dragHatMove;
    document.onmouseup = dragHatEnd;

    document.ontouchmove = dragHatMove;
    document.ontouchend = dragHatEnd;

    function dragHatMove(e) {
        let clientObj = {};
        if (e.targetTouches) {
            clientObj.clientX = e.targetTouches[0].pageX;
            clientObj.clientY = e.targetTouches[0].pageY;
        } else {
            clientObj.clientX = e.clientX;
            clientObj.clientY = e.clientY;
        }
        let newLeft = clientObj.clientX - avatarLeft - disX;
        let newTop = clientObj.clientY - avatarTop - disY;
        let maxLeft = avatar.offsetWidth - hatBox.offsetWidth / 2;
        let minLeft = -hatBox.offsetWidth / 2;
        let maxTop = avatar.offsetHeight - hatBox.offsetHeight / 2;
        let minTop = -hatBox.offsetHeight / 2;
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
        curX = newLeft;
        curY = newTop;
        hatBox.style.left = newLeft + 'px';
        hatBox.style.top = newTop + 'px';
    }
    function dragHatEnd(e) {
        document.onmousemove = null;
        document.ontouchend = null;
    }
};

/* 2、展示图片预览 */
function loadImage() {

    let file = new FileReader();
    file.readAsDataURL(document.getElementById('upload').files[0]);
    file.onload = function (params) {
        document.getElementById('avatar_img').src = file.result;
    }
    showResult(false);
}


function downloadImage() {
    hatBox.style.border = 'none';
    rotateImg.classList.remove('active');
    spreadImg.classList.remove('active');

    html2canvas(document.getElementById('avatar')).then(function (canvas) {
        resultImageUrl = canvas.toDataURL("image/png");
        let resultImg = document.getElementById('result-img');
        resultImg.src = resultImageUrl;
        resultImg.onload = function () {
            if (hatBox.offsetTop < 0) {
                hatBox.style.top = 0;
            }
            // 创建一个 a 标签，设置 download 属性，点击时下载文件
            var save_link = document.createElement('a');
            save_link.href = resultImageUrl;
            save_link.download = 'avatar.png';
            save_link.click();
            showResult(true);

        }
    });
}

function prevTemplate() {
    var current = parseInt(document.getElementById('avatar_template').alt);
    current = (current - 1 + 40) % 41;
    if (current === 0) {
        current = 1;
    }
    document.getElementById('avatar_template').src = './cap/' + (current < 10 ? '0' + current : current) + '.png';
    document.getElementById('avatar_template').alt = current;
}

function nextTemplate() {
    var current = parseInt(document.getElementById('avatar_template').alt);
    current = (current + 1) % 41;
    if (current === 0) {
        current = 1;
    }
    document.getElementById('avatar_template').src = './cap/' + (current < 10 ? ('0' + current) : current) + '.png';
    document.getElementById('avatar_template').alt = current;
}

function showResult(status) {
    if (status) {
        document.getElementById('modify-area').classList.add('hide');
        document.getElementById('result-area').classList.add('active');
    } else {
        document.getElementById('modify-area').classList.remove('hide');
        document.getElementById('result-area').classList.remove('active');
    }
}
