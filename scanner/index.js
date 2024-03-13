//開啟全螢幕
function openFullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

//關閉全螢幕
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

//檢測目前螢幕狀態
function checkFullscreen() {
    return (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);
}

//檢查瀏覽器是否有相機、麥克風、耳機等多媒裝置 
async function checkEnumerateDevices(selectId) {
    try {
        if (!navigator.mediaDevices?.enumerateDevices) {
            alert("瀏覽器不支援多媒體裝置");
            return false;
        } else {
            var devices = await navigator.mediaDevices.enumerateDevices();
            return getDevices(devices, selectId);
        }
    }
    catch (err) {
        console.error(`${err.name}: ${err.message}`);
        alert(`${err.name}: ${err.message}`);
        return false;
    }
}

//取得相機設備
function getDevices(devices, selectId) {
    try {
        //設定鏡頭選單元件變數
        var sel = document.getElementById(selectId);
        //設定鏡頭選單項目元件變數
        var opt = null;
        //歷遍裝置內容
        devices.forEach((device) => {
            //只要相機設備
            if (device.kind == "videoinput") {
                //將相機相關參數加入至選單
                opt = document.createElement('option');
                opt.value = device.deviceId;
                opt.innerHTML = device.label;
                sel.appendChild(opt);
            }
        });
        //相機選單最少要有一個鏡頭
        if (sel.length > 0) {
            var selectcamera = localStorage.getItem("CameraId");
            //如果瀏覽器有紀錄上一次鏡頭就將選單指向該鏡頭
            if (selectcamera != null && selectcamera != '') {
                sel.value = selectcamera;
            }
            return true;
        }
        else {

            return false;
        }
    }
    catch (err) {
        alert(`${err.name}: ${err.message}`);
        return false;
    }

}

// 檢查瀏覽器條碼掃描是否支援
function checkBarcodeSupport() {
    try {
        // 檢查瀏覽器條碼掃描是否支援
        if (!("BarcodeDetector" in globalThis)) {
            console.log("此瀏覽器不支援條碼掃描。");
            return false;

        } else {
            console.log("此瀏覽器支援條碼掃描");
            return true;

        }
    }
    catch (err) {
        console.log("此瀏覽器不支援條碼掃描。");
        return false;
    }
}

//開啟相機
async function openCamera(selectId, videoId, focalId) {
    stopCamera(videoId);
    //設定開啟相機參數
    var constraints = {
        audio: false,
        video: { frameRate: { min: 10, max: 30 }, deviceId: document.getElementById(selectId).value, },
    };
    //開啟相機 
    try {
        var stream = await navigator.mediaDevices.getUserMedia(constraints);
        openCameraSuccess(stream, videoId, focalId);
    }
    catch (err) {
        console.log(`${err.name}: ${err.message}`);
    }

}

//開啟相機成功
function openCameraSuccess(mediaStream, videoId, focalId) {
    //設定影片元件變數
    const myvideo = document.getElementById(videoId);
    //將鏡頭串流賦予給影片元件
    myvideo.srcObject = mediaStream;
    setapplyConstraints(false, true, videoId, focalId);

}
/*
//開啟相機失敗
function openCameraError(err) {
    console.error(`${err.name}: ${err.message}`);

}
*/
//關閉相機串流
function stopCamera(videoId) {
    try {
        //設定影片元件變數
        const myvideo = document.getElementById(videoId);
        //取得影片元件串流
        const stream = myvideo.srcObject;
        //如果串流不等於NULL
        if (stream != null) {
            //擷取視訊軌道
            const tracks = stream.getTracks();
            //歷遍所有視訊並停止
            tracks.forEach((track) => {
                track.stop();
            });
            //中斷影片串流
            myvideo.srcObject = null;
        }
    } catch (err) {
        console.log(err);
        alert(err);
    }
}

//設定鏡頭參數，light電筒按鈕觸發=True、其他=False,focalfirst相機第一次開啟=True、其他=False
function setapplyConstraints(light, focalfirst, videoId, focalId) {
    try {
        //設定影片元件變數
        const myvideo = document.getElementById(videoId);
        //取得影片元件串流
        const stream = myvideo.srcObject;
        //如果串流不等於NULL
        if (stream != null) {
            //擷取視訊軌道第一筆
            const track = stream.getVideoTracks()[0];
            //取得視訊軌道個功能相關參數
            const capabilities = track.getCapabilities();
            //取得視訊軌道目前設定
            const settings = track.getSettings();
            //建立一個空陣列用來儲存參數
            var advanced = [];
            if (checkZoom(focalfirst, focalId, capabilities, settings, track)) {
                //新增焦距參數
                advanced.push({
                    zoom: localStorage.getItem("Focal")
                });
            }
            if (checkTorch(settings, track)) {
               var torch =  localStorage.getItem("Torch");
                //如果是經由電筒按鈕觸發，必須將手電筒開關參數做反轉
                if (light) {
                    
                    torch = !torch;
                    localStorage.setItem("Torch", torch);
                }
                //新增手電筒參數
                advanced.push({
                    torch: torch
                });
            }
            //變更視訊軌道參數
            track.applyConstraints({
                advanced: advanced
            });
        }
    } catch (err) {
        console.log(err);
        alert(err);
    }
}

//檢查是否可輸入焦距參數
function checkZoom(focalfirst, focalId, capabilities, settings, track) {
    if (!('zoom' in settings)) {
        console.log('焦距不支援: ' + track.label);
        return false;
    }
    else {
        //如果相機第一次開啟，必須將將焦距參數做設定
        if (focalfirst) {
            //設定鏡頭焦距元件變數
            const focal = document.getElementById(focalId);
            const focalvalue = document.getElementById(`${focalId}value`);
            //設定焦距參數
            focal.min = capabilities.zoom.min;
            focal.max = capabilities.zoom.max;
            focal.step = capabilities.zoom.step;
            var Focal = localStorage.getItem("Focal");
            //賦予當前焦距參數
            if (Focal != null) {
                if (Focal > capabilities.zoom.max) {
                    focal.value = capabilities.zoom.max;
                }
                else if (Focal < capabilities.zoom.min) {
                    focal.value = capabilities.zoom.min;
                }
                else {
                    focal.value = Focal;
                }
                localStorage.setItem("Focal", focal.value);
            }
            else {
                focal.value = settings.zoom;
            }
            focalvalue.innerHTML = focal.value;
        }
        return true;
    }
}

//檢查是否可輸入手電筒參數
function checkTorch(settings, track) {

    if (!('torch' in settings)) {
        console.log('手電筒不支援: ' + track.label);
        return false;
    }
    else {
        return true;

    }
}

//切換相機
function mediaDevices_onchange(selectId, videoId, focalId) {
    //關閉手電筒
    localStorage.setItem("Torch", false);

    //儲存相機ID，下次使用會先選擇此相機
    localStorage.setItem("CameraId", document.getElementById(selectId).value);
    openCamera(selectId, videoId, focalId,);
}

//依照螢幕方向決定影片尺寸
function screen_orientation(canvasId) {
    //設定畫布元件變數
    const mycanvas = document.getElementById(canvasId);
    //垂直 畫布寬度設100% 高度設自動調整 ，水平 畫布寬度設自動調整 高度設100%
    switch (screen.orientation.type) {
        case "landscape-primary":
        case "landscape-secondary":
            mycanvas.style.width = "auto";
            mycanvas.style.height = "100%";
            break;
        case "portrait-secondary":
        case "portrait-primary":
            mycanvas.style.width = "100%";
            mycanvas.style.height = "auto";
            break;
        default:
            //不存在上述條件
            console.log(" orientation API 不支援此瀏覽器");
    }
}

//儲存掃描區域數值
function setscannervalue(scannerId) {
    //設定掃描區域元件變數
    const scanner = document.getElementById(scannerId);
    if (scanner.max > 100) {
        localStorage.setItem(scannerId, scanner.value);
    }
}

//顯示掃描區域數值
function showscannervalue(scannerId) {
    //設定掃描區域元件變數
    const scanner = document.getElementById(scannerId);
    const scannervalue = document.getElementById(`${scannerId}value`);
    scannervalue.innerHTML = scanner.value;
}

//初始化監聽器
function intiaddEventListener(scannerwId, scannerhId, focalId, videoId, settingId, torchId, fullscreenId, canvasId, selectId) {
    //設定掃描區域寬度元件變數
    const scannerw = document.getElementById(scannerwId);
    //顯示掃描區域寬度數值
    showscannervalue(scannerwId);
    //當使用者移動掃描區域寬度
    scannerw.addEventListener("input", (event) => {
        setscannervalue(scannerwId);
        showscannervalue(scannerwId);
    });

    //設定掃描區域長度元件變數
    const scannerh = document.getElementById(scannerhId);
    //顯示掃描區域長度數值
    showscannervalue(scannerhId);
    //當使用者移動掃描區域高度
    scannerh.addEventListener("input", (event) => {
        setscannervalue(scannerhId);
        showscannervalue(scannerhId);
    });

    //設定鏡頭焦距元件變數
    const focal = document.getElementById(focalId);
    const focalvalue = document.getElementById(`${focalId}value`);
    //當使用者移動焦距
    focal.addEventListener("input", (event) => {
        setapplyConstraints(false, false);
        localStorage.setItem("Focal", focal.value);
        focalvalue.innerHTML = focal.value;
    });

    //設定影片元件變數
    const myvideo = document.getElementById(videoId);
    //監聽影片元件有資料進入就撥放，
    myvideo.addEventListener("loadedmetadata", (event) => {
        myvideo.play();
    });
    //設定設定按鈕元件變數
    const btn_setting = document.getElementById(settingId);
    //開關設定畫面
    btn_setting.addEventListener('click', function () {
        try {
            //設定設定畫面元件變數
            const settingdiv = document.querySelector('.content');
            //display狀態為none就更改為inline(顯示)，狀態為其他就更改為none(影藏)
            if (settingdiv.style.display == "none") {
                settingdiv.style.display = "inline";
            }
            else {
                settingdiv.style.display = "none";
            }
        } catch (err) {
            console.log(err);
            alert(err);
        }
    });
    //設定手電筒按鈕元件變數
    const btn = document.getElementById(torchId);
    //監聽按鈕手電筒，如果手機有多顆鏡頭不會每個鏡頭都能開手電筒
    btn.addEventListener('click', function () {
        setapplyConstraints(true, false);
    });
    //設定全螢幕按鈕元件變數
    const btn_fullscreen = document.getElementById(fullscreenId);
    //設定全螢幕圖示變數
    const fullscreenicon = document.getElementById(`${fullscreenId}icon`);
    //開關全螢幕
    btn_fullscreen.addEventListener('click', function () {

        if (checkFullscreen()) {
            closeFullscreen();
            fullscreenicon.innerHTML = 'fullscreen';
        } else {
            openFullscreen();
            fullscreenicon.innerHTML = 'fullscreen_exit';
        }
    });
    //監聽全螢幕狀態
    document.addEventListener('fullscreenchange', () => {
        if (checkFullscreen()) {
            fullscreenicon.innerHTML = 'fullscreen_exit';
        } else {
            fullscreenicon.innerHTML = 'fullscreen';
        }
    });
    //監聽瀏覽器螢幕方向
    screen.orientation.addEventListener("change", (event) => {
        screen_orientation(canvasId);
        openCamera(selectId, videoId, focalId);
    });



}

// 渲染畫面
function drawImge(scannerwId, scannerhId, videoId, canvasId, barcodevalueId, pointvalueId) {
    try {
        //設定畫布元件變數
        const mycanvas = document.getElementById(canvasId);
        //設定顯示條碼結果元件變數
        const barcodevalue = document.getElementById(barcodevalueId);
        //設定顯示條碼結果點位元件變數
        const pointvalue = document.getElementById(pointvalueId);
        //設定影片元件變數
        const myvideo = document.getElementById(videoId);
        //取得影片元件串流
        const stream = myvideo.srcObject;
        //如果串流不等於NULL
        if (stream != null) {

            //在畫布上建立2D物件
            var ctx = mycanvas.getContext('2d');
            //變更canvas大小等於清空
            mycanvas.width = myvideo.videoWidth;
            mycanvas.height = myvideo.videoHeight;
            //設定掃描區域寬度元件變數
            const scannerw = document.getElementById(scannerwId);
            //設定掃描區域寬度元件參數
            scannerw.max = mycanvas.width;
            //讀取儲存掃描區域寬度
            var ScannerW = localStorage.getItem(scannerwId);
            //當它存在
            if (ScannerW != null) {
                //儲存寬度大於畫布寬度
                if (ScannerW > mycanvas.width) {
                    //寬度元件賦予畫布寬度
                    scannerw.value = mycanvas.width;
                    setscannervalue(scannerwId);

                }
                //儲存寬度不等於畫布寬度
                else if (ScannerW != scannerw.value) {
                    //寬度元件賦予畫布寬度
                    scannerw.value = ScannerW;
                    setscannervalue(scannerwId);

                }
            }
            showscannervalue(scannerwId);
             //設定掃描區域長度元件變數
             const scannerh = document.getElementById(scannerhId);
            //設定掃描區域長度元件參數 
            scannerh.max = mycanvas.height;
            //讀取儲存掃描區域高度
            var ScannerH = localStorage.getItem(scannerhId);
            //當它存在
            if (ScannerH != null) {
                //儲存高度大於畫布高度
                if (ScannerH > mycanvas.height) {
                    //高度元件賦予畫布高度
                    scannerh.value = mycanvas.height;
                    setscannervalue(scannerhId);
                }
                //儲存高度不等於畫布高度
                else if (ScannerH != scannerh.value) {
                    //高度元件賦予畫布高度
                    scannerh.value = ScannerH;
                    setscannervalue(scannerhId);
                }
            }
            showscannervalue(scannerhId);

            //將相機畫面渲染至canvas
            ctx.drawImage(myvideo, 0, 0, mycanvas.width, mycanvas.height);
            //計算出掃描區域的起始座標X
            var scannerx = (mycanvas.width - scannerw.value) / 2;
            //計算出掃描區域的起始座標Y
            var scannery = (mycanvas.height - scannerh.value) / 2;
            // mycanvas與掃描區域交集
            let region = new Path2D();
            region.rect(0, 0, mycanvas.width, mycanvas.height);
            region.rect(scannerx, scannery, scannerw.value, scannerh.value);
            ctx.clip(region, "evenodd");
            //透明度
            ctx.globalAlpha = 0.5;
            //顏色
            ctx.fillStyle = "black";
            //填滿顏色區域
            ctx.fillRect(0, 0, mycanvas.width, mycanvas.height);
            //擷取出要掃描的區域
            const myImageData = ctx.getImageData(scannerx, scannery, scannerw.value, scannerh.value);
            // 建立條碼種類
            var barcodeDetector = new BarcodeDetector({
                formats: ["code_128", "qr_code"],
            });
            // 清空條碼結果
            barcodevalue.innerHTML = '';
            //檢測條碼
            barcodeDetector
                .detect(myImageData)
                .then((barcodes) => {
                    //條碼點位
                    var cornerPoints = '';
                    //條碼
                    var result = '';
                    //設定掃描區域大小
                    ctx.rect(scannerx, scannery, scannerw.value, scannerh.value);
                    //設定掃描區域外框粗細
                    ctx.lineWidth = "10";
                    //設定掃描區域外框顏色
                    ctx.strokeStyle = "red";
                    //當檢測出符合條碼的種類外框變綠色
                    if (barcodes.length > 0) {
                        //取得第一筆條碼結果
                        var barcode = barcodes[0];
                        //賦予條碼
                        result += ` ${barcode.rawValue}, `;
                        //賦予條碼點位
                        cornerPoints += ` [${barcode.boundingBox.x}, ${barcode.boundingBox.y},${barcode.boundingBox.width},${barcode.boundingBox.height}]  `;
                        cornerPoints += `,[${mycanvas.offsetWidth},${mycanvas.offsetHeight}],[${myvideo.videoWidth},${myvideo.videoHeight}] `;
                        //設定掃描區域外框顏色
                        ctx.strokeStyle = "green";
                    }
                    //畫出可掃描區域
                    ctx.stroke();
                    //顯示結果
                    barcodevalue.innerHTML = `${result}`;
                    pointvalue.innerHTML = cornerPoints;
                    //document.getElementById('cornerPoints').innerHTML= `畫面顯示大小:[${myvideo.width},${myvideo.height}],相機畫面大小:[${myvideo.videoWidth},${myvideo.videoHeight}]`;
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        else {
            //變更canvas大小等於清空
            mycanvas.width = window.visualViewport.width;
            mycanvas.height = window.visualViewport.height;
        }
    } catch (err) {
        console.log(err);
        alert(err);
    }
    finally {
        //不管成功失敗100毫秒後執行drawImge
        setTimeout(function() {drawImge(scannerwId, scannerhId, videoId, canvasId, barcodevalueId, pointvalueId)}, 100);
    }
}
