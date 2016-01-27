/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.

 * */
/************ Sliding animation **************/
var controlsShown = true;
var slideTime = 500;

$("#three-canvas").on("click", function(){
    if (!controlsShown){
        $("#controls").animate({
            left: '0%'
        }, slideTime);
        
    } else {
         $("#controls").animate({
            left: '-20%'
        }, slideTime);
    }
    controlsShown = controlsShown === true ? false : true;
})

/***************************************HANDLE USER INPUT HERE *******************************/
/*Variables for tracking change*/
var lastHorzStep = 0;
var curHorzStep = 0;
var lastVertStep = 0;
var curVertStep = 0;
var lastMotionSpanStep = 0;
var curMotionSpanStep = 0;
var lastSpeed = 0;
var curSpeed = 0;


/*Check boxes*/
$('#Top-show').click(function() {
    drawBottom = $(this).is(':checked');
    console.log($(this).is(':checked'));
    scene.remove(shapes);
    redraw();
    scene.add(shapes);
});
$('#Bottom-show').click(function() {
    drawTop = $(this).is(':checked');
    console.log($(this).is(':checked'));
    scene.remove(shapes);
    redraw();
    scene.add(shapes);
});
$('#Left-show').click(function() {
    drawLeft = $(this).is(':checked');
    console.log($(this).is(':checked'));
    scene.remove(shapes);
    redraw();
    scene.add(shapes);
});
$('#Right-show').click(function() {
    drawRight = $(this).is(':checked');
    console.log($(this).is(':checked'));
    scene.remove(shapes);
    redraw();
    scene.add(shapes);
});

$('#horizontal-phase').click(function(){
    shapeInfo.cAntiPhase = $(this).is(':checked');
    resetCirclePositions();
});

$('#tracer-toggle').click(function(){
    toggleTracers(tracerVect);
});
$('#flashlag-toggle').click(function(){
   shapeInfo.cFlashLag = $(this).is(':checked');
});

$('#square-grow-toggle').click(function(){
    shapeInfo.sqGrow = $(this).is(':checked');
});

$('#circle-pause-toggle').click(function(){
    shapeInfo.cPause = $(this).is(':checked');
});

$('#square-animate-toggle').click(function(){
    shapeInfo.sqAnimate = $(this).is(':checked');
});
$('#square-line-animate-toggle').click(function(){
    
    var status = $(this).is(':checked');
    
    shapeInfo.sqLines = status;
    
   for (var i = 0; i < lines.length; i++){
       lines[i].setVisible(status);
   }
});


$('#square-rotate-toggle').click(function(){
    if($(this).is(':checked')){
        centerSquare.rotation.z = Math.PI * 0.25;
    } else {
        centerSquare.rotation.z = 0;
    }
});

$('#square-fill-toggle').click(function(){ 
    
    centerSquareFill.visible = $(this).is(':checked');
});

$('#square-visibility').click(function(){ 
    centerSquare.visible = $(this).is(':checked');
});

$('#kaniza-visibility').click(function(){ 
    kaniza.visible = $(this).is(':checked');
});

$('#mouse-light-toggle').click(function() {
    mouseLightPos = $(this).is(':checked');
    console.log("UNCKECED!!");
});

$('#stereo-toggle').click(function() {
    stereo = $(this).is(':checked');
    renderer.setViewport(0, 0, w, h); //RESET THE RENDERER FOR REGULAR VIEWING
    renderer.setScissor(0, 0, w, h);
});

$('#stereo-flip').click(function() {
    stereoOffset *= -1;
});


/*Set up sliders*/
$(function() {
    
    $("#shape-type").selectmenu({
        
        create: function(event, ui){
            
             hideShowSliders();
        },
        
        change: function(event, data ){
            shapeInfo.cFillType = parseInt(data.item.value);
            scene.remove(shapes);
            redraw();
            scene.add(shapes);
            console.log("Current: " + currentShapeType + " ShapeinfO: "+ shapeInfo.cFillType);
           
            hideShowSliders();
            
            
        },
                //width: controlW 
    });
    $("#material-type").selectmenu({
        
        create: function(event, ui){
            hideShowSliders();  
        },
        
        change: function(event, data ){
            shapeInfo.materialType = parseInt(data.item.value);
            scene.remove(shapes);
            redraw();
            scene.add(shapes);
            
            hideShowSliders();
        },
        //width: controlW 
    });
    
    $("#albedo").slider({
        orientation: "horizontal",
        range: "min",
        max: 100,
        value: 50, 
        slide: updateAlbedo,
        change: updateAlbedo
    });
    $("#transparency").slider({
        orientation: "horizontal",
        range: "min",
        max: 100,
        value: 100, 
        slide: updateTransparency,
        change: updateTransparency
    });
    $("#radius").slider({
        orientation: "horizontal",
        range: "min",
        min: 1,
        max: 50,
        value: 15, 
        slide: updateRadius,
        change: updateRadius
    });
    
    $("#radiusX").slider({ /*NO LONGER RADIUS X! Actually elongation!*/
        orientation: "horizontal",
        range: "min",
        min: 1,
        max: 30,
        value: 15, 
        slide: updateRadiusX,
        change: updateRadiusX
    });

    $("#horizontalPos").slider({
        orientation: "horizontal",
        range: "min",
        min: -10,
        max: 10,
        value: 0, 
        slide: updateHorzPos,
        change: updateHorzPos, 
        start: function(event, ui){ lastHorzStep = ui.value;},
        stop: function(event, ui){ curHorzStep = ui.value;}
    });
     $("#verticalPos").slider({
        orientation: "horizontal",
        range: "min",
        min: -10,
        max: 10,
        value: 0, 
        slide: updateVertPos,
        change: updateVertPos, 
        start: function(event, ui){ lastVertStep = ui.value;},
        stop: function(event, ui){ curVertStep = ui.value;}
    });
    $("#motionSpan").slider({
        orientation: "horizontal",
        range: "min",
        min: -10,
        max: 10,
        value: 0, 
        slide: updateMotionSpan,
        change: updateMotionSpan, 
        start: function(event, ui){ lastMotionSpanStep = ui.value;},
        stop: function(event, ui){ curMotionSpanStep = ui.value;}
    });
    $("#speed").slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 60,
        value: 15, 
        slide: updateSpeed,
        change: updateSpeed
    });
    $("#trajectory-rotation").slider({
        orientation: "horizontal",
        range: "min",
        min: -1.0,
        max: 1.1, /*This is a glitch, only actually goes to 1*/
        value: 0, 
        step: 0.1,
        animate: "slow",
        slide: updateTrajectoryRotation,
        change: updateTrajectoryRotation
    });
    $("#num_segments").slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 8,
        value: 8,
        animate: "slow",
        slide: updateNumSegments,
        change: updateNumSegments
    });
    
    $("#sineCirclefrequency").slider({
        orientation: "horizontal",
        range: "min",
        min: 6,
        max: 26,
        value: 10,
        step: 2,
        animate: "slow",        
        slide: updateSineCircleFrequency,
        change: updateSineCircleFrequency
    });
    $("#sineCircleAmps").slider({
        orientation: "horizontal",
        range: "min",
        min: 1,
        max: 50,
        value: 20,
        animate: "slow",
        slide: updateSineCircleAmps,
        change: updateSineCircleAmps
    });
     $("#specularity").slider({
        orientation: "horizontal",
        range: "min",
        min: 1,
        max: 200,
        value: 100,
        animate: "slow",
        slide: updateSpecularity,
        change: updateSpecularity
    });
    $("#squareColor").slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 100,
        value: 100,
        animate: "slow",
        slide: updateSquareColor,
        change: updateSquareColor
    });
     $("#squareSize").slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 100,
        value: 50,
        animate: "slow",
        slide: updateSquareSize,
        change: updateSquareSize
    });
    $("#squareThickness").slider({
        orientation: "horizontal",
        range: "min",
        min: 0.2,
        max: 50,
        value: 0.2,
        animate: "slow",
        slide: updateSquareThickness,
        change: updateSquareThickness
    });
        $("#squareGap").slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: shapeInfo.sqWidthHeight/2,
        value: 0,
        animate: "slow",
        slide: updateSquareGap,
        change: updateSquareGap
    });
    
    /************ Square Overlaid Lines *******/
      $("#squareLineColor").slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 100,
        value: 100,
        animate: "slow",
        slide: updateSquareLineColor,
        change: updateSquareLineColor
    });
    
    
    /************ Fill Square *******/
      $("#squareFillColor").slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 100,
        value: 100,
        animate: "slow",
        slide: updateSquareFillColor,
        change: updateSquareFillColor
    });
    
    /******Fo' the background*******/
     $("#backgroundColor").slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 100,
        value: 0,
        animate: "slow",
        slide: updateBackgroundColor,
        change: updateBackgroundColor
    });
    
    /*********Light Intensity**************/
    $("#light-intensity").slider({
        orientation: "horizontal",
        range: "min",
        max: 25,
        value: 10, 
        animate: "slow",
        slide: updateLightIntensity,
        change: updateLightIntensity
    });
});


/************MOUSE INPUT ***************/
/************MOUSE INPUT ***************/
/************MOUSE INPUT ***************/


$(window).mousemove(function (event){
    if (mouseLightPos){
        var mousePos = screenToWorld(event, camera);
        pointLight.position.x = mousePos.x * 300;
        pointLight.position.y = mousePos.y * 300;
    }
    
    
});

/*****************KEYBOARD INPUT**********************/
/*****************KEYBOARD INPUT**********************/
/*****************KEYBOARD INPUT**********************/
$(window).on("keyup", function (event){
   console.log("ascii#: " + event.which)
    if (event.which === 81){
        mouseLightPos = mouseLightPos === true ? false : true;
        document.getElementById("mouse-light-toggle").checked = mouseLightPos;
    } 
    else if (event.which === 32){
        runAnimation = runAnimation === true ? false : true; 
        
        if (!runAnimation){
            $("#pause").show();
        } else {
            $("#pause").hide();
        }
    
        /*Enter key goes fullscreen*/    
    } else if (event.which === 13) {
        goFullScreen();   
    } 
});


/***************User input modifications*******************/

function updateAlbedo(){
    var curAlbedo = $("#albedo").slider("value")/100;
    var oldHSL = shapes.children[0].material.color.getHSL();
    for (var i = 0; i < shapes.children.length; i++){
        shapes.children[i].material.color.setHSL(oldHSL.h, oldHSL.s, curAlbedo);
    }
    /*Update the values in shapeInfo also!*/
    shapeInfo.cIntColour = new THREE.Color(curAlbedo, curAlbedo, curAlbedo);
}

function updateTransparency(){
    var curTransparency = $("#transparency").slider("value")/100;
    for (var i = 0; i < shapes.children.length; i++){
        shapes.children[i].material.opacity = curTransparency;
    }
    shapeInfo.cIntAlpha = curTransparency;
}

function updateRadius(){
    var curRadius = $("#radius").slider("value");
    
    if (shapeInfo.cFillType === ShapeTypes.CIRCLE_FILLED){
        shapeInfo.cRadius = shapeInfo.cRadiusX = curRadius; //Update everything
    } else {
        shapeInfo.cRadius = curRadius;
    }
    scene.remove(shapes);
    redraw();
    scene.add(shapes);
}

function updateRadiusX(){
    shapeInfo.cRadiusX = $("#radiusX").slider("value");
    scene.remove(shapes);
    redraw();
    scene.add(shapes);
}


function updateHorzPos(){
    var deltaX = curHorzStep - lastHorzStep; //Get the change in slider position (not its absolute value)
    
    /*update positions AND SHAPEINFO*/
    shapes.children[Pos.LEFT].position.x += deltaX;
    shapes.children[Pos.RIGHT].position.x -=  deltaX;
    shapeInfo.cCirclePositions[Pos.LEFT][0] += deltaX;
    shapeInfo.cCirclePositions[Pos.RIGHT][0] -=  deltaX;    
}

function updateVertPos(){
    var deltaY = curVertStep - lastVertStep; //Get the change in slider position (not its absolute value)
    
    /*update positions AND SHAPEINFO*/
    shapes.children[Pos.TOP].position.y += deltaY;
    shapes.children[Pos.BOTTOM].position.y -=  deltaY;
    shapeInfo.cCirclePositions[Pos.TOP][1] += deltaY;
    shapeInfo.cCirclePositions[Pos.BOTTOM][1] -=  deltaY;    
}

function updateMotionSpan(){
    var motionSpanChange = curMotionSpanStep - lastMotionSpanStep;
    shapeInfo.cSpanFromSquare += motionSpanChange;
}

function updateSpeed(){
    /*Update speed just has a range of speed values that you can take, you cant just keep adding
     * This alleviates the need for boundary checking etc.
     * */
    shapeInfo.cSpeed = $("#speed").slider("value")/1000;
}
function updateTrajectoryRotation(){

    /*Reset the positions of the x & y for vertical & horizontal movement, then*/    
    shapes.children[Pos.TOP].position.x =  shapeInfo.cCirclePositions[Pos.TOP][0] = 0;
    shapes.children[Pos.BOTTOM].position.x = shapeInfo.cCirclePositions[Pos.BOTTOM][0] = 0;
    shapes.children[Pos.LEFT].position.y  = shapeInfo.cCirclePositions[Pos.LEFT][1] = 0;
    shapes.children[Pos.RIGHT].position.y = shapeInfo.cCirclePositions[Pos.RIGHT][1] = 0;
   
    shapeInfo.cAngle = $("#trajectory-rotation").slider("value") - shapeInfo.cAngle;  /*This is DELTA angle*/ 
}

function updateNumSegments(){
    var numSegsIdx = $("#num_segments").slider("value");
    var segsOptions = [3, 4, 5, 6, 7, 8, 10, 20, 200];
    shapeInfo.cNumSegments = segsOptions[numSegsIdx]; 
    scene.remove(shapes);
    redraw();
    scene.add(shapes);
}

function updateSineCircleFrequency(){
    shapeInfo.cFreq = $("#sineCirclefrequency").slider("value");
    
    console.log("CURRENT FREQ VALUE: " + shapeInfo.cFreq);
    scene.remove(shapes);
    redraw();
    scene.add(shapes);
}

function updateSineCircleAmps(){
    shapeInfo.cAmps = $("#sineCircleAmps").slider("value")/10;
    scene.remove(shapes);
    redraw();
    scene.add(shapes);
}

/***************SPHERE FUNCTIONS ****************/
function updateSpecularity(){
    shapeInfo.sphSpecularity = $("#specularity").slider("value");
    
    var curSpecularity = { shininess: shapeInfo.sphSpecularity};        //THIS IS HOW YOU PASS SPECIAL VARIABLES IN
    for (var i = 0; i < shapes.children.length; i++){
        shapes.children[i].material.setValues(curSpecularity);
    }
    
}

/**************SQUARE FUNCTIONS ***********/

function updateSquareColor(){
    var colour = $("#squareColor").slider("value")/100;
    var formattedColour = new THREE.Color(colour, colour, colour);
    for (var i = 0; i < centerSquare.children.length; i++){
        centerSquare.children[i].material.color = formattedColour;
    }
    shapeInfo.sqOutlineColor = formattedColour;
}

function updateSquareSize(){
    var size = $("#squareSize").slider("value");
    shapeInfo.sqWidthHeight = size;
     redrawSquare();        
}

function updateSquareThickness(){
    shapeInfo.sqThickness = $("#squareThickness").slider("value");    
    redrawSquare();
    redrawLines();
}

function updateSquareGap(){
    shapeInfo.sqGapSize = $("#squareGap").slider("value");
    redrawSquare();       
}

function redrawSquare(){
     scene.remove(centerSquare);
     
     if ($('#square-fill-toggle').is(':checked')){
        centerSquare = drawFilledSquare(0,0,shapeInfo.sqWidthHeight + shapeInfo.sqThickness, shapeInfo.sqWidthHeight  + shapeInfo.sqThickness, shapeInfo.sqOutlineColor);  
     } else {
        centerSquare = drawOutlineSquareWithMovableEdges(0, 0, shapeInfo.sqWidthHeight, shapeInfo.sqWidthHeight, shapeInfo.sqOutlineColor, shapeInfo.sqThickness, shapeInfo.sqGapSize);
     }
     
    scene.add(centerSquare); 
}

function redrawLines(){
    for (var i = 0; i < lines.length; i++){
        lines[i].setSize(shapeInfo.sqThickness, shapeInfo.sqThickness);
    }
//    
//    lines = loadLinesOnly(shapeInfo);
}

/*******************FILL SQUARE******************/
function updateSquareFillColor(){
    var colour = $("#squareFillColor").slider("value")/100;
   
   if (colour > 1){
       
       console.log("GRADIETN!!");
       var texture = new THREE.Texture (generateTexture());
       var materialGradient = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
       
       centerSquareFill.children[0].material = materialGradient;
       
   } else {
       
       var formattedColour = new THREE.Color(colour, colour, colour);
        
        /*Because you've put this in a object3D when you created it. not sure its even neccessary any more...*/
        centerSquareFill.children[0].material.color = formattedColour;
        
        shapeInfo.sqOutlineColor = formattedColour;  
   }
   
}
updateSquareLineColor
function updateSquareLineColor(){
    var colour = $("#squareLineColor").slider("value")/100;
       
    var formattedColour = new THREE.Color(colour, colour, colour);
    
    /*Because you've put this in a object3D when you created it. not sure its even neccessary any more...*/
    for (var i = 0; i < lines.length; i++){
        lines[i].setColor(formattedColour);
    }
}

/*********** BACKGROUND FUNCTIONS ********/

function updateBackgroundColor(){
    var colour = $("#backgroundColor").slider("value")/100;
    var formattedColour = new THREE.Color(colour, colour, colour);
    renderer.setClearColor(formattedColour, 1);
//        for (var i = 0; i < centerSquare.children.length; i++){
//        centerSquare.children[i].material.color = new THREE.Color(1 - colour,1 - colour,1 - colour);
//    }
}

function updateLightIntensity(){
    
    var curIntensity = $("#light-intensity").slider("value")/10;
    pointLight.intensity = curIntensity;
    console.log(curIntensity);

    
}


/********** HIDING & SHOWING SLIDERS ******/

function hideShowSliders(){
    
    console.log(shapeInfo.cFillType);
    
    /*Sliders unique to CIRCLE_FILLED*/
    if (shapeInfo.cFillType === ShapeTypes.CIRCLE_FILLED){
  
        var ids = ["radiusX"];
        showHelper(ids);
    } else {
        var ids = ["radiusX"];
        hideHelper(ids);
    }
    
    /*Sliders unique to waveform circles*/
     if (shapeInfo.cFillType === ShapeTypes.CIRCLE_SINE_FILLED || shapeInfo.cFillType === ShapeTypes.CIRCLE_SINE_OUTLINE || shapeInfo.cFillType === ShapeTypes.CIRCLE_TRIANGLE_FILLED){
        var ids = ["sineCircleAmps", "sineCirclefrequency"];
        showHelper(ids);
        
        hideHelper(["num_segments"]);
        
    } else {
        var ids = ["sineCircleAmps", "sineCirclefrequency"];
        hideHelper(ids);
        
        showHelper("num_segments");
    } 
    
    /*Sliders unique to the specular surface*/
    if (shapeInfo.materialType === MaterialTypes.PHONG){
        showHelper("specularity");
    } else {
        hideHelper("specularity");
    }
    
    if (shapeInfo.materialType === MaterialTypes.BASIC){
        $("#mouse-light-toggle-and-lable").hide();
        hideHelper("light-intensity");
        
    } else {
        $("#mouse-light-toggle-and-lable").show();
        showHelper("light-intensity");
    }
    
    showEssentialSliders();
}

function showEssentialSliders(){
    var ids = ["albedo", "transparency", "horizontalPos", "verticalPos", "motionSpan", "speed"];
    showHelper(ids);
}

function showHelper(ids){
        
    if (ids.constructor === Array){
        for (var i = 0; i < ids.length; i++){
            $("#" + ids[i]).show();
            $("label[for=" + ids[i] + "]").show();   
        }
    } else {
        $("#" + ids).show();
        $("label[for=" + ids + "]").show(); 
    }
}

function hideHelper(ids){
    
    if (ids.constructor === Array){
        for (var i = 0; i < ids.length; i++){
            $("#" + ids[i]).hide();
            $("label[for=" + ids[i] + "]").hide();   
        }
    } else {
        
        $("#" + ids).hide();
        $("label[for=" + ids + "]").hide(); 
    }
    
}