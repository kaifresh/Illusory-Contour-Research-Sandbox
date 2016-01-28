


/*
    if (window.Worker){
            console.log("Sending data to worker");
            var worker = new Worker("canvasBufferWorker.js");
            var jsonData = JSON.stringify(imageSequence);
            console.log("Data is now in JSON format");
            worker.postMessage(jsonData);
        } else {
            alert("Your browser does not have workers enabled. Video cannot be processed");
        }
        
 */

onmessage = function(imageSequence) {
  console.log('Message received from main script');
//  var workerResult = 'Result: ' + (e.data[0] * e.data[1]);

    imageSequence = JSON.parse(imageSequence);
//        /*After storing all the frames, put them in the cut*/
    var imagesFromBuffer = [];                
    for (var i = 0; i < imageSequence.length; i++){
        imagesFromBuffer.push(imageSequence[i].toDataURL());
    }

  
   $.ajax({
            xhr: function() {
                
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        //Do something with upload progress here
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
            
            data: {data: imagesFromBuffer},
            
            success: function (data, textStatus, jqXHR) {
                print("\n\nDATA:\n");
                print(data);
                print("\n\nTEXT STATUS: \n");
                $("#video-message").text(textStatus);
                videoExists = true;
                alert("video ready to download");
                $("#download-video").attr({href: window.location.href+'/py/out.avi'});
                
//                  postMessage(imagesFromBuffer);

            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("#video-message").text(textStatus);
                print(errorThrown);
                $("#download-video").attr({href: ''});  
                
                alert("There was an error creating the video");
            }
        });
        
    console.log('Posting message back to main script');

};