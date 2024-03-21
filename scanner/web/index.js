function openFullscreen(){var elem=document.documentElement;if(elem.requestFullscreen){elem.requestFullscreen();}else if(elem.mozRequestFullScreen){elem.mozRequestFullScreen();}else if(elem.webkitRequestFullscreen){elem.webkitRequestFullscreen();}else if(elem.msRequestFullscreen){elem.msRequestFullscreen();}}
function closeFullscreen(){if(document.exitFullscreen){document.exitFullscreen();}else if(document.mozCancelFullScreen){document.mozCancelFullScreen();}else if(document.webkitExitFullscreen){document.webkitExitFullscreen();}else if(document.msExitFullscreen){document.msExitFullscreen();}}
function checkFullscreen(){return(document.fullscreenElement&&document.fullscreenElement!==null)||(document.webkitFullscreenElement&&document.webkitFullscreenElement!==null)||(document.mozFullScreenElement&&document.mozFullScreenElement!==null)||(document.msFullscreenElement&&document.msFullscreenElement!==null);}
async function checkEnumerateDevices(selectId){try{if(!navigator.mediaDevices?.enumerateDevices){console.log('瀏覽器不支援多媒體裝置');postMessage("Message:瀏覽器不支援多媒體裝置");return false;}else{var devices=await navigator.mediaDevices.enumerateDevices();var result=getDevices(devices,selectId);if(!result){console.log('瀏覽器查無此裝置相機鏡頭');postMessage("Message:瀏覽器查無此裝置相機鏡頭");}
else{result=checkBarcodeSupport();}
return result;}}
catch(err){console.error(`${err.name}: ${err.message}`);postMessage(`Message:${err.name}: ${err.message}`);return false;}}
function getDevices(devices,selectId){try{var sel=document.getElementById(selectId);var opt=null;devices.forEach((device)=>{if(device.kind=="videoinput"){opt=document.createElement('option');opt.value=device.deviceId;opt.innerHTML=device.label;console.log(device.label);sel.add(opt);}});if(sel.length>0){var selectcamera=localStorage.getItem("CameraId");if(selectcamera!=null&&selectcamera!=''){sel.value=selectcamera;}
return true;}
else{return false;}}
catch(err){return false;}}
function checkBarcodeSupport(){try{if(!("BarcodeDetector"in globalThis)){console.log("此瀏覽器不支援條碼掃描。");postMessage("Message:此瀏覽器不支援條碼掃描。");return false;}else{console.log("此瀏覽器支援條碼掃描");return true;}}
catch(err){console.log("此瀏覽器不支援條碼掃描。");postMessage("Message:此瀏覽器不支援條碼掃描。");return false;}}
async function openCamera(selectId,videoId,focalId){stopCamera(videoId);var sel=document.getElementById(selectId);if(sel.length>0&&sel.value!==null){var constraints={audio:false,video:{frameRate:{min:10,max:30},deviceId:sel.value,},};try{var stream=await navigator.mediaDevices.getUserMedia(constraints);openCameraSuccess(stream,videoId,focalId);}
catch(err){console.error(`${err.name}: ${err.message}`);postMessage(`Message:${err.name}: ${err.message}`);}}
else{console.error("瀏覽器無法取得相機鏡頭");postMessage("Message:瀏覽器無法取得相機鏡頭");}}
function openCameraSuccess(mediaStream,videoId,focalId){const myvideo=document.getElementById(videoId);myvideo.srcObject=mediaStream;setapplyConstraints(false,true,videoId,focalId);}
function stopCamera(videoId){try{const myvideo=document.getElementById(videoId);const stream=myvideo.srcObject;if(stream!=null){const tracks=stream.getTracks();tracks.forEach((track)=>{track.stop();});myvideo.srcObject=null;}}catch(err){console.log(err);postMessage(`Message:${err.name}: ${err.message}`);}}
function setapplyConstraints(light,focalfirst,videoId,focalId){try{const myvideo=document.getElementById(videoId);const stream=myvideo.srcObject;if(stream!=null){const track=stream.getVideoTracks()[0];const capabilities=track.getCapabilities();const settings=track.getSettings();var advanced=[];if(checkZoom(focalfirst,focalId,capabilities,settings,track)){advanced.push({zoom:localStorage.getItem("Focal")});}
if(checkTorch(settings,track)){var flashlight=localStorage.getItem("Torch")=="true";if(light){flashlight=!flashlight;localStorage.setItem("Torch",flashlight);}
advanced.push({torch:flashlight});}
track.applyConstraints({advanced:advanced});}}catch(err){console.log(err);postMessage(`Message:${err.name}: ${err.message}`);}}
function checkZoom(focalfirst,focalId,capabilities,settings,track){if(!('zoom'in settings)){console.log('焦距不支援: '+track.label);return false;}
else{if(focalfirst){const focal=document.getElementById(focalId);const focalvalue=document.getElementById(`${focalId}value`);focal.min=capabilities.zoom.min;focal.max=capabilities.zoom.max;focal.step=capabilities.zoom.step;var Focal=localStorage.getItem("Focal");if(Focal!=null){if(Focal>capabilities.zoom.max){focal.value=capabilities.zoom.max;}
else if(Focal<capabilities.zoom.min){focal.value=capabilities.zoom.min;}
else{focal.value=Focal;}
localStorage.setItem("Focal",focal.value);}
else{focal.value=settings.zoom;}
focalvalue.innerHTML=focal.value;}
return true;}}
function checkTorch(settings,track){if(!('torch'in settings)){console.log('手電筒不支援: '+track.label);return false;}
else{return true;}}
function mediaDevices_onchange(selectId,videoId,focalId){localStorage.setItem("Torch",false);localStorage.setItem("CameraId",document.getElementById(selectId).value);openCamera(selectId,videoId,focalId,);}
function screen_orientation(canvasId){const mycanvas=document.getElementById(canvasId);switch(screen.orientation.type){case"landscape-primary":case"landscape-secondary":mycanvas.style.width="auto";mycanvas.style.height="100%";break;case"portrait-secondary":case"portrait-primary":mycanvas.style.width="100%";mycanvas.style.height="auto";break;default:console.log(" orientation API 不支援此瀏覽器");}}
function setscannervalue(scannerId){const scanner=document.getElementById(scannerId);if(scanner.max>100){localStorage.setItem(scannerId,scanner.value);}}
function showscannervalue(scannerId){const scanner=document.getElementById(scannerId);const scannervalue=document.getElementById(`${scannerId}value`);scannervalue.innerHTML=scanner.value;}
function intiaddEventListener(scannerwId,scannerhId,focalId,videoId,settingId,torchId,fullscreenId,canvasId,selectId){const scannerw=document.getElementById(scannerwId);showscannervalue(scannerwId);scannerw.addEventListener("input",(event)=>{setscannervalue(scannerwId);showscannervalue(scannerwId);});const scannerh=document.getElementById(scannerhId);showscannervalue(scannerhId);scannerh.addEventListener("input",(event)=>{setscannervalue(scannerhId);showscannervalue(scannerhId);});const focal=document.getElementById(focalId);const focalvalue=document.getElementById(`${focalId}value`);focal.addEventListener("input",(event)=>{localStorage.setItem("Focal",focal.value);focalvalue.innerHTML=focal.value;setapplyConstraints(false,false,videoId,focalId);});const myvideo=document.getElementById(videoId);myvideo.addEventListener("loadedmetadata",(event)=>{myvideo.play();});const btn_setting=document.getElementById(settingId);btn_setting.addEventListener('click',function(){try{const settingdiv=document.querySelector('.content');if(settingdiv.style.display=="none"){settingdiv.style.display="inline";}
else{settingdiv.style.display="none";}}catch(err){console.log(err);}});const btn_torch=document.getElementById(torchId);btn_torch.addEventListener('click',function(){setapplyConstraints(true,false,videoId,focalId);});const btn_fullscreen=document.getElementById(fullscreenId);const fullscreenicon=document.getElementById(`${fullscreenId}icon`);btn_fullscreen.addEventListener('click',function(){if(checkFullscreen()){closeFullscreen();fullscreenicon.innerHTML='fullscreen';}else{openFullscreen();fullscreenicon.innerHTML='fullscreen_exit';}});document.addEventListener('fullscreenchange',()=>{if(checkFullscreen()){fullscreenicon.innerHTML='fullscreen_exit';}else{fullscreenicon.innerHTML='fullscreen';}});screen.orientation.addEventListener("change",(event)=>{screen_orientation(canvasId);openCamera(selectId,videoId,focalId);});window.addEventListener('message',(event)=>{console.log('received response:  ',event.data);});}
function drawImge(scannerwId,scannerhId,videoId,canvasId,barcodevalueId,pointvalueId){var result='';try{const mycanvas=document.getElementById(canvasId);const barcodevalue=document.getElementById(barcodevalueId);const pointvalue=document.getElementById(pointvalueId);const myvideo=document.getElementById(videoId);const stream=myvideo.srcObject;if(stream!=null){var ctx=mycanvas.getContext('2d');mycanvas.width=myvideo.videoWidth;mycanvas.height=myvideo.videoHeight;const scannerw=document.getElementById(scannerwId);scannerw.max=mycanvas.width;var ScannerW=localStorage.getItem(scannerwId);if(ScannerW!=null){if(ScannerW>mycanvas.width){scannerw.value=mycanvas.width;setscannervalue(scannerwId);}
else if(ScannerW!=scannerw.value){scannerw.value=ScannerW;setscannervalue(scannerwId);}}
showscannervalue(scannerwId);const scannerh=document.getElementById(scannerhId);scannerh.max=mycanvas.height;var ScannerH=localStorage.getItem(scannerhId);if(ScannerH!=null){if(ScannerH>mycanvas.height){scannerh.value=mycanvas.height;setscannervalue(scannerhId);}
else if(ScannerH!=scannerh.value){scannerh.value=ScannerH;setscannervalue(scannerhId);}}
showscannervalue(scannerhId);ctx.drawImage(myvideo,0,0,mycanvas.width,mycanvas.height);var scannerx=(mycanvas.width-scannerw.value)/2;var scannery=(mycanvas.height-scannerh.value)/2;let region=new Path2D();region.rect(0,0,mycanvas.width,mycanvas.height);region.rect(scannerx,scannery,scannerw.value,scannerh.value);ctx.clip(region,"evenodd");ctx.globalAlpha=0.5;ctx.fillStyle="black";ctx.fillRect(0,0,mycanvas.width,mycanvas.height);const myImageData=ctx.getImageData(scannerx,scannery,scannerw.value,scannerh.value);var barcodeDetector=new BarcodeDetector({formats:["code_128","qr_code"],});barcodevalue.innerHTML='';barcodeDetector.detect(myImageData).then((barcodes)=>{var cornerPoints='';ctx.rect(scannerx,scannery,scannerw.value,scannerh.value);ctx.lineWidth="10";ctx.strokeStyle="red";if(barcodes.length>0){var barcode=barcodes[0];result=` ${barcode.rawValue}, `;cornerPoints+=` [${barcode.boundingBox.x}, ${barcode.boundingBox.y},${barcode.boundingBox.width},${barcode.boundingBox.height}]  `;cornerPoints+=`,[${mycanvas.offsetWidth},${mycanvas.offsetHeight}],[${myvideo.videoWidth},${myvideo.videoHeight}] `;ctx.strokeStyle="green";}
ctx.stroke();barcodevalue.innerHTML=`${result}`;pointvalue.innerHTML=cornerPoints;if(barcodes.length>0&&result!=''){postMessage(`Barcode:${result}`);}}).catch((err)=>{console.log(err);});}
else{mycanvas.width=window.visualViewport.width;mycanvas.height=window.visualViewport.height;}}catch(err){console.log(err);}
finally{if(result==''){setTimeout(function(){drawImge(scannerwId,scannerhId,videoId,canvasId,barcodevalueId,pointvalueId)},100);}}}
function postMessage(message){setTimeout(()=>{window.parent.postMessage(message)},"1000");}