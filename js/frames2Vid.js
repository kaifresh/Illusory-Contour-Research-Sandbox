/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var videoExists = false;

var doCaptureCanvas = false;
var startCapture = false;

var isProcessingCanvas = false; //Used to block multiple buton clicks while the image is being captured

var imageSequence = [];

$("#video-capture").click(function(){
    
    if (!isProcessingCanvas){
        imageSequence = []; //Empty the images 
        $("#video-message").text("Fired click. Capturing frames...");    
        doCaptureCanvas = true; 
        isProcessingCanvas = true;
    }
    
    
});

/*This will fire as long as doCaptureCanvas is true*/
function captureCanvasFramesAndProcess(canvas){
    
    /*Wait until the start of a cycle to begin saving frames*/
    if (shapeInfo.cLastWaveV < 0.25){
        startCapture = true;
        console.log("Capture started at begining of cycle!");
    }
    
    /*Fired at the start of a cycle*/
    if (startCapture){
        
        imageSequence.push(copyCanvasFrame(canvas)); //always png by default
        
        /*When you've done one cycle*/
        if (shapeInfo.cLastWaveV < 0.25 && imageSequence.length > 10){
            startCapture = false;
            doCaptureCanvas = false;
            console.log("Capture ended at end of movement cycle!");
            var imagesFromCanvasBuffer = processImageSequence(imageSequence)
            sendDataToServer(imagesFromCanvasBuffer);
            
            //            zipImageSequence(imagesFromCanvasBuffer);
        }
    }
    
}

function copyCanvasFrame(canvas){
    
    var buffer = document.createElement('canvas');
    buffer.width = canvas.width;
    buffer.height = canvas.height;
    
    buffer.getContext('2d').drawImage(canvas,0,0);
    
    return buffer;
}

function processImageSequence(imageSequence){
    
    $("#video-message").text("Captured " + imageSequence.length + " images!...transcoding server side. Please wait.");
    
    /*After storing all the frames, put them in the cut*/
    var imagesFromBuffer = [];                
    for (var i = 0; i < imageSequence.length; i++){
        imagesFromBuffer.push(imageSequence[i].toDataURL());
    }
    
    console.log("Frames captured, sending to server");
    
    return imagesFromBuffer;
}

function zipImageSequence(imageSequence){
    zip.workerScriptsPath = "/Illusory_Contour_Sandbox/js/vendor/zipjs/";   
    
    
    for (var i = 0; i < imageSequence.length; i++){
        
        var blob = new Blob([imageSequence[i]], {type: 'image/png'});
        
        var fileName = "img.png";
        
        zip.createWriter(new zip.BlobWriter("application/zip",  function(zipWriter){
            
            zipWriter.add(fileName, new zip.BlobReader(blob), function(){
                zipWriter.close(function(output){                   
                    console.log(output);                   
                });
            });
            
        }, onerror));        
    }   
}



function sendDataToServer(imageSequence){
    
    shouldContinueAnimating = true;
    animLoop(1)
    
    
    $.ajax({
        xhr: function() {
            
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    //Do something with upload progress here
                    //                        console.log("Percent complete: " + percentComplete);
                }
            }, false);
            
            xhr.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    //Do something with download progress
                    console.log("Current percent complete: " + percentComplete);
                }
            }, false);
            
            return xhr;
        },
        type: "POST",
        url: "py/test.py",
        
        data: {data: imageSequence, doDeleteImages: $("#do-delete-frames").is(':checked')},//LOLOLOLOLOLOLOL
        
        success: function (data, textStatus, jqXHR) {
            print("\n\nDATA:\n");
            print(data);
            print("\n\nTEXT STATUS: \n");
            $("#video-message").text(textStatus);
            videoExists = true;
            shouldContinueAnimating = false; //Stop animlooop
            isProcessingCanvas = false;
            
            $("#download-video").attr({href: window.location.href+'/py/out.mov'});
            
            alert("video ready to download");
            
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#video-message").text(textStatus);
            print(errorThrown);
            shouldContinueAnimating = false;
            isProcessingCanvas = false;
            $("#download-video").attr({href: ''});                
        }
    });
}


function animLoop(curIdx){
    
    var colorString = ["red", 'white'];    
    curIdx = curIdx === 1 ? 0 : 1; //FLip it
    
    if (shouldContinueAnimating){
        $("#video-message").animate({color: colorString[curIdx]}, {duration: 500, 
            complete: function(){
                animLoop(curIdx);
            }
        });
    }    
}

function print(anything){
    console.log(anything);
}



function _base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}