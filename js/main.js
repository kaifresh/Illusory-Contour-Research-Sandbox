
window.addEventListener( 'resize', onWindowResize, false );

/*Handles window resizes. */
function onWindowResize(){
    
    console.log(camera);
    console.log(cameraLeft);
    
    w = $(document).width();
    h = $(document).height();
    
    /*For the ortho camera*/
    if (camera.hasOwnProperty("left")){
        camera.left = w / - orthoOffset;
        camera.right = w  / orthoOffset;
        camera.top = h / orthoOffset;
        camera.bottom = h / - orthoOffset;
    }
    /*For the perspective camera*/
    else if (camera.hasOwnProperty("apsect")){        
        camera.aspect = w/h;
    }
    
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
}


/***DETECTOR****/
if (!Detector.webgl) {
    
    var body = $('body');
    body.text("Sorry, your browser doesn't support WebGL!");
    body.append("<br><a href=\"http://get.webgl.org\"> Click here to get webGL poppin'</a>");
    body.css("text-align", "center");
    body.css("margin-top", "10%");
    body.css("font-size", "20px");
    
    $("#three-canvas").remove();
    $("#controls").remove();
}

/***THREE JS IMPLEMENTATION***/
var Pos = Object.freeze({TOP: 0, BOTTOM: 1, LEFT: 2, RIGHT: 3});
var MovementTypes = Object.freeze({EXPANDING_SQUARE: 0, ANTIPHASE_CIRCLES_SINE: 1, ANTIPHASE_CIRCLES_TRIANGLE: 2});

var w = $(document).width();
var h = $(document).height();

/*****SHAPE INFO DEFINITION*****/
var shapeInfo = {
    backgroundColor: 0,
    drawHowMany: Object.size(Pos),
    /*Circle size positioning and appearance*/
    cDist: 30,
    cCirclePositions: [],
    cRadius: 12,
    cRadiusX: 12,
    cIntColour: "rgb(127, 127, 127)",
    cIntAlpha: 1,
    cFillType: ShapeTypes.CIRCLE_FILLED,
    cNumSegments: 200,
    cFreq: 10,
    cAmps: 2,
    /*Circle movement handling*/
    cSpanFromSquare: 20,
    cLastH: 0,
    cLastV: 0,
    cMotionCoeff: 0,
    cStartDistanceFromSquare: 5,
    cSpeed: 0.015,
    cAngle: 0.0,
    cAntiPhase: false,
    cPause: false,
    cFlashLag: false,
    cFlashLagDuration: 10,
    /*Sphere Stuff*/
    sphSpecularity: 100,
    /*Square Size, Positioning, and appearance*/
    sqWidthHeight: 35,
    sqThickness: 0.2,
    sqInteriorColor: 0,
    sqOutlineColor: "rgb(255, 255, 255)",
    sqAlpha: 1,
    sqType: SquareTypes.SQUARE_SHARP,
    sqGrow: false,
    sqGapSize: 0,
    sqLines: false,
    meshDensity: 10,
    /*Square Movement Waves*/
    sqLastSin: 0,
    sqLastSinGrow: 0,
    sqAnimate: false,
    sqGrow: false,
    sqDrawKaniza: false,
    /*light*/
    lightIntensity: 1,
    /*Material*/
    materialType: MaterialTypes.BASIC,
    cFlukeTexture: new THREE.Texture() 
};

//This means you can change the values but cant add to shapeInfo
Object.seal(shapeInfo);

/*Inserting all data that cant just be created from the drop*/
initShapeInfo(shapeInfo);

/* MAIN MAIN MAIN MAIN : Start the animation only when everything loads*/
$(window).load(function () {
    //    $("#loading-screen").remove(); //REMEMBER TO COMMENT THIS LINE OUT WHEN YOU'RE DONE
    $("#loading-screen").fadeOut({duration: 700});
    render();
    
    /* 
     * A possibly overcomplicated way to do it, but it keeps the sliders and the backend (shapeinfo etc) consistent! */
    var posDrag = w * 0.06;
    var spanDrag = -( w * 0.05 );
    $("#verticalPos").simulate('drag', {dx: posDrag, dy: 0});
    $("#horizontalPos").simulate('drag', {dx: posDrag, dy: 0});
    $("#motionSpan").simulate('drag', {dx: spanDrag, dy: 0});
});

/********************** GLOBAL CONTROL VARIALBES ***********/
var currentShapeType = 0;
var totalShapeTypes = Object.size(ShapeTypes);

var mouseLightPos = false;
var drawTop = drawBottom = drawLeft = drawRight = true;

/*STEREO VARIABLES*/
var stereo = false;
var separation = -2;
var stereoOffset = 2;

var cameraZ = 100;

var runAnimation = true;

/**********************************Necessary THREE.JS setup things*************************************/
/*Create the renderer, set its size and add it to the page*/
var renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
var canvas = $('#three-canvas');
canvas.append(renderer.domElement);

/*Create scene/stage*/
var scene = new THREE.Scene();

/**MONO CAMERA**/
/**MONO CAMERA**/
/*Create camera (orthographic means you DONT have FORESHORTENING)*/
var orthoOffset = 10;
var camera = new THREE.OrthographicCamera( w / - orthoOffset, w / orthoOffset, h / orthoOffset, h / - orthoOffset, 1, 1000);

var fov = 250;
//var camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = cameraZ;

/*****STEREO CAMERAS*****/
/*****STEREO CAMERAS*****/
/*****STEREO CAMERAS*****/
cameraLeft = new THREE.PerspectiveCamera(fov, (window.innerWidth / 2) / window.innerHeight, 0.1, 1000);
cameraLeft.position.z = cameraZ;
cameraRight = new THREE.PerspectiveCamera(fov, (window.innerWidth / 2) / window.innerHeight, 0.1, 1000);
cameraRight.position.z = cameraZ;

scene.add(cameraLeft);
scene.add(cameraRight);



/*Create a ilght source*/
var pointLight = new THREE.DirectionalLight(0xFFFFFF, 1);
// set its position
pointLight.position.x = 0;
pointLight.position.y = 0;
pointLight.position.z = 500;
// add to the scene
scene.add(pointLight);

/**************************************Initialise the Shapes in the display********************************/
var shapes = loadCircles(shapeInfo);
scene.add(shapes);
//shapes.position.z = -10;

var centerSquare = drawOutlineSquareWithMovableEdges(0, 0, shapeInfo.sqWidthHeight, shapeInfo.sqWidthHeight, shapeInfo.sqOutlineColor, shapeInfo.sqThickness, shapeInfo.sqGapSize);
scene.add(centerSquare);

var kaniza = drawKaniza();
scene.add(kaniza);
kaniza.visible = shapeInfo.sqDrawKaniza;

var centerSquareFill = drawFilledSquare(0,0,shapeInfo.sqWidthHeight - shapeInfo.sqThickness/2, shapeInfo.sqWidthHeight  - shapeInfo.sqThickness/2, shapeInfo.sqOutlineColor);  
centerSquareFill.visible = false;
scene.add(centerSquareFill);


//$("#Top-show").click();
//$("#Bottom-show").click();
//$("#Left-show").click();
//$("#Right-show").click();
var lines = loadLinesOnly(shapeInfo);
//$("#square-line-animate-toggle").click();


var tracerVect = drawTracers();
toggleTracers(tracerVect); //Hide them initially

var flshR = 1;
var flashLag = drawCircle(shapeInfo.sqWidthHeight/2, 0, flshR, flshR, 10, 0xffffff, 100, 0, MaterialTypes.BASIC);
flashLag.position.z = 2.1; //Just above the occluders (z = 2)
flashLag.visible = false;
scene.add(flashLag);


console.log("You should start thinking about turning each individual shape into a class. \n\Thus you can set the individual geometries and material of each shape.. :) ");

/******Rendering*******/
function render() {
    
           
    if (runAnimation){
        /*No matter what, always process the motion Coeff*/
        shapeInfo.cMotionCoeff += shapeInfo.cSpeed;
        if (!shapeInfo.cPause){
            handleTracerMovement();
                        
            handleMovement();               
        }
        
    }
    
    /*Process movement of the square edges - At the moment, this isn't that insightful a manipulation*/
    if (shapeInfo.sqAnimate){
        handleSquareMovement();  
    }
    
    if (shapeInfo.sqLines){
        handleLineMovement();
    }
    
    if (shapeInfo.sqGrow){
        handleSquareGrow();
    }
    
    if (shapeInfo.cFlashLag){
        handleFlashLag();
    }
    
    if (!stereo) {
        renderer.render(scene, camera);
        
    } else {
        
        /*****STEREO CAMERAS*****/
        /*****STEREO CAMERAS*****/
        /*****STEREO CAMERAS*****/
        shapes.position.z = 0.01;
        
        var width = Math.round(window.innerWidth / 2);
        var height = window.innerHeight;
                
        // Render the scene
        renderer.setViewport(0, 0, width, height);
        renderer.setScissor(0, 0, width, height);
        renderer.enableScissorTest(true);
        
        cameraLeft.updateProjectionMatrix();
        //cameraLeft.rotation.y = eyeRotation;
//        cameraLeft.position.set(separation, 0, cameraZ); //Gives it the foreshortening
        
        /*Displace the left shapes*/
        shapes.position.x -= stereoOffset;
        renderer.render(scene, cameraLeft);
        shapes.position.x += stereoOffset;
        
        /*Render the right half of the scene*/
        renderer.setViewport(width, 0, width, height);
        renderer.setScissor(width, 0, width, height);
        renderer.enableScissorTest(true);
        
        cameraRight.updateProjectionMatrix();
        //cameraRight.rotation.y = -eyeRotation;
//        cameraRight.position.set(-separation, 0, cameraZ);
        
        /*Displace the right shapes*/
        shapes.position.x += stereoOffset;
        renderer.render(scene, cameraRight);
        shapes.position.x -= stereoOffset;
        
        /*****STEREO CAMERAS*****/
        /*****STEREO CAMERAS*****/
        /*****STEREO CAMERAS*****/
    }
    
    /*No matter what, render.*/
    requestAnimationFrame(render);
}

/////////////////////////////////////////////////
////////////                        ////////////
////////////   MOVEMENT HANDLERS!   ////////////
////////////                        ////////////
/////////////////////////////////////////////////
function handleMovement() {
    
    /*This gives a triangular wave of period 0 -> 1. Then you scale it with triSpan*/
    var curTriVert = Math.abs((shapeInfo.cMotionCoeff % 2) - 1) * shapeInfo.cSpanFromSquare;
    var verticalMovement = shapeInfo.cLastV === 0 ? 0.01 : curTriVert - shapeInfo.cLastV; //Ternary operator for the first pass
    
    /*PHASE: Use an offset to put the movement out of phase by 90deg.
     * NOTE - This only offsets the movement, the positioning is also handled by */
    var phaseStep = shapeInfo.cAntiPhase ? 0.5 : 0;
    var curTriHorz = Math.abs(((shapeInfo.cMotionCoeff + phaseStep) % 2) - 1) * shapeInfo.cSpanFromSquare;
    var horizontalMovement = shapeInfo.cLastH === 0 ? 0.01 : curTriHorz - shapeInfo.cLastH; /*Get delta movement*/
     
    shapes.children[Pos.TOP].position.y += verticalMovement;    
    shapes.children[Pos.BOTTOM].position.y -= verticalMovement;
    shapes.children[Pos.LEFT].position.x += horizontalMovement;
    shapes.children[Pos.RIGHT].position.x -= horizontalMovement;
        
    /*IMPORTANT
     * Update shapeinfo circle positions too - so they stay on trajectory 
     * Now they dont jump back to the start point
     * */
    shapeInfo.cCirclePositions[Pos.TOP][1] += verticalMovement;
    shapeInfo.cCirclePositions[Pos.BOTTOM][1] -= verticalMovement;
    shapeInfo.cCirclePositions[Pos.LEFT][0] += horizontalMovement;
    shapeInfo.cCirclePositions[Pos.RIGHT][0] -=  horizontalMovement;
    
    
    /*DIAGONAL MOVEMENT - always going, but starts w cAngle = 0*/
    shapes.children[Pos.TOP].position.x += verticalMovement * shapeInfo.cAngle;
    shapes.children[Pos.BOTTOM].position.x -= verticalMovement * shapeInfo.cAngle;
    shapes.children[Pos.LEFT].position.y -= horizontalMovement * shapeInfo.cAngle;
    shapes.children[Pos.RIGHT].position.y += horizontalMovement * shapeInfo.cAngle;
    
    /*Record Diagonal in shapinfo*/
    shapeInfo.cCirclePositions[Pos.TOP][0] = shapes.children[Pos.TOP].position.x;
    shapeInfo.cCirclePositions[Pos.BOTTOM][0] = shapes.children[Pos.BOTTOM].position.x;
    shapeInfo.cCirclePositions[Pos.LEFT][1] = shapes.children[Pos.LEFT].position.y;
    shapeInfo.cCirclePositions[Pos.RIGHT][1] = shapes.children[Pos.RIGHT].position.y;
    
    shapeInfo.cLastV = curTriVert;
    shapeInfo.cLastH = curTriHorz;
}

function handleLineMovement(){
    for (var i = 0; i < lines.length; i++){
        
        if (i % 2 === 0){
            lines[i].growby(5, true);
        } else {
            lines[i].growby(5, false);
        }
    }
}


function handleTracerMovement(){
//    tracer.setPositionRelativeTo(shapes.children[Pos.BOTTOM], centerSquare, Pos.BOTTOM);

    for (var i = 0; i <= Pos.RIGHT; i++){        
        tracerVect[i].setPositionRelativeTo(shapes.children[i], centerSquare, i);
    }
}

var canGoAgain = true;
function handleFlashLag(){
    /*Dont need to get the bounding box of the square as you have its size and implicitly know the square is at [0,0]*/
    if (shapes.children[Pos.RIGHT].position.x - shapeInfo.cRadius <= shapeInfo.sqWidthHeight/2 && canGoAgain){
        flashLag.visible = true;
        canGoAgain = false;
        setTimeout(function(){flashLag.visible = false}, shapeInfo.cFlashLagDuration);
    }
    
    /*Only allow the flash to occur if the circle has fully come off the square*/
    if (shapes.children[Pos.RIGHT].position.x - shapeInfo.cRadius > shapeInfo.sqWidthHeight/2){
        canGoAgain = true;
    }
    
//    flashLag.position.x = shapes.children[Pos.RIGHT].position.x - shapeInfo.cRadius;
//    flashLag.position.z = 2.1;
//    flashLag.visible = true;
//    if (shapes.children[Pos.RIGHT].position.y < shapeInfo.sqWidthHeight){
//        flashLag.visible = true;
//    }
}


function handleSquareMovement(){
    
    var sinSpan = 6;//shapeInfo.sqGapSize/2;
    var curSine = Math.sin(shapeInfo.cMotionCoeff * 3) * sinSpan + sinSpan;    
    var gapChange = curSine - shapeInfo.sqLastSin;
    shapeInfo.sqLastSin = curSine;
    
    shapeInfo.sqGapSize += gapChange;
    //    console.log("gapsize: " + shapeInfo.sqGapSize + ". curSine: " + curSine + ". Gap Change: " + gapChange);
    redrawSquare();
}

function handleSquareGrow(){
    
    var sinSpan = 6;//shapeInfo.sqGapSize/2;
    var curSine = Math.sin(shapeInfo.cMotionCoeff * 3) * sinSpan + sinSpan;    
    var squareGrow = curSine - shapeInfo.sqLastSinGrow;
    shapeInfo.sqLastSinGrow = curSine;
    
    
    shapeInfo.sqWidthHeight += squareGrow;
    redrawSquare(); 
}

function resetCirclePositions(){
    
    /*This is what continuously drives waveform movement*/
    shapeInfo.cMotionCoeff = 0;
    
    /*PHASE: Handle Phase Offset - First half of the phase is set */
    var halfSpan = 0
    if (shapeInfo.cAntiPhase) {
        halfSpan = shapeInfo.cSpanFromSquare/2;
    }
    
     /*Initialise circle positions here*/
    var squareHalf = shapeInfo.sqWidthHeight/2;
    var offset = shapeInfo.cStartDistanceFromSquare;
    
    shapeInfo.cCirclePositions.push([0, - squareHalf - offset]); //TOP
    shapeInfo.cCirclePositions.push([0, squareHalf + offset]);    //BOTTOM
    shapeInfo.cCirclePositions.push([ - squareHalf - offset - halfSpan, 0]);    //LEFT
    shapeInfo.cCirclePositions.push([squareHalf + offset + halfSpan, 0]);    //LEFT
}


function initShapeInfo(shapeInfo) {
      
    resetCirclePositions();
    
    /*THIS IS A PRELOADING OF THE TEXTURE */
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load("img/flukeMesh.png", function(texture){
        shapeInfo.cFlukeTexture = texture;
    });  
}


/**/
function setPositions(children){
    
    for (var i = 0; i < Object.size(Pos); i++){   
        children[i].position.x += shapeInfo.cCirclePositions[i][0];
        children[i].position.y += shapeInfo.cCirclePositions[i][1];
    }   
}














/*****LOADERS!*****/
function loadCircles(shapeInfo) {
    
    var circleContainer = new THREE.Object3D();

    for (var i = 0; i < Object.size(Pos); i++){
        
        /*Handling elipses*/
        var radX, radY;
        
        if (i === Pos.LEFT || i === Pos.RIGHT){
            radY = shapeInfo.cRadius;
            radX = shapeInfo.cRadiusX;
        } else if (i === Pos.TOP || i === Pos.BOTTOM){
            radX = shapeInfo.cRadius;
            radY = shapeInfo.cRadiusX;
        }
        
        circleContainer.add(drawCircle(0,0, radX, radY, shapeInfo.cNumSegments, shapeInfo.cIntColour, shapeInfo.cIntAlpha, shapeInfo.sphSpecularity, shapeInfo.materialType)); //TOP CIRCLE
    }
    
    setPositions(circleContainer.children);
    
    return circleContainer;
}

function loadCirclesOutline(shapeInfo) {
    
    var circleContainer = new THREE.Object3D();
    for (var i = 0; i < Object.size(Pos); i++){
        circleContainer.add(drawCircleOutline(0,0, shapeInfo.cRadius, shapeInfo.cIntColour, shapeInfo.cNumSegments, shapeInfo.cIntAlpha));  
    }
    setPositions(circleContainer.children);
    
    return circleContainer;
}

function loadSemiCircles(shapeInfo) {
    
    var circleContainer = new THREE.Object3D();
//x, y, r, fillColor, alpha, materialType, orientation
    for (var i = 0; i < Object.size(Pos); i++){
        circleContainer.add(drawSemiCircle(0,0, shapeInfo.cRadius, shapeInfo.cIntColour, shapeInfo.cIntAlpha, shapeInfo.materialType, i)); //TOP CIRCLE
    }
    
    setPositions(circleContainer.children);
    
    return circleContainer;
}

//function drawRightTriangle (x, y, opp, adj, fillColor, alpha, materialType, orientation){
function loadRightTriangle(shapeInfo) {
    
    var circleContainer = new THREE.Object3D();
//x, y, r, fillColor, alpha, materialType, orientation
    for (var i = 0; i < Object.size(Pos); i++){
        circleContainer.add(drawRightTriangle(0,0, shapeInfo.cRadius, shapeInfo.cRadius, shapeInfo.cIntColour, shapeInfo.cIntAlpha, shapeInfo.materialType, i)); //TOP CIRCLE
    }
    
    setPositions(circleContainer.children);
    
    return circleContainer;
}

function loadSineCircleFilled(shapeInfo) {
    
    var circleContainer = new THREE.Object3D();
    
    for (var i = 0; i < Object.size(Pos); i++){
        circleContainer.add(drawSineCircleGeometry(0,0, shapeInfo.cRadius, shapeInfo.cNumSegments, shapeInfo.cFreq, shapeInfo.cAmps, shapeInfo.cIntColour, shapeInfo.cIntAlpha, 0, 0, shapeInfo.sphSpecularity, shapeInfo.materialType));
    }
    
    setPositions(circleContainer.children);
    
    return circleContainer;
}

function loadSineCircleOutline(shapeInfo) {
    var circleContainer = new THREE.Object3D();
    
    for (var i = 0; i < Object.size(Pos); i++){
        circleContainer.add(drawSineCircleOutline(0,0, shapeInfo.cRadius, shapeInfo.cNumSegments, shapeInfo.cFreq, shapeInfo.cAmps, shapeInfo.cIntColour, shapeInfo.cIntAlpha));
    }
    setPositions(circleContainer.children);
    
    return circleContainer;
}



function loadCircleGridMesh(shapeInfo) {
    var circleContainer = new THREE.Object3D();
    
    for (var i = 0; i < Object.size(Pos); i++){
        circleContainer.add(drawCircleGridMesh(0, 0, shapeInfo.cRadius, shapeInfo.cNumSegments / 2, shapeInfo.cIntColour, shapeInfo.cIntAlpha));
    }  
    setPositions(circleContainer.children);

    return circleContainer;
    
}

function loadSpecularSpheres(shapeInfo) {
    var circleContainer = new THREE.Object3D();
    
    for (var i = 0; i < Object.size(Pos); i++){
        circleContainer.add(drawSpecularSphere(0,0, shapeInfo.cRadius, shapeInfo.cNumSegments, shapeInfo.cIntColour, shapeInfo.cIntAlpha, shapeInfo.sphSpecularity, shapeInfo.materialType)); //TOP CIRCLE
    }  
    setPositions(circleContainer.children);
    
    return circleContainer;
}

function loadFlukeCircle(shapeInfo){
    var circleContainer = new THREE.Object3D();
    for (var i = 0; i < Object.size(Pos); i++){
        circleContainer.add(drawFlukeTexture(0,0, shapeInfo.cRadius, shapeInfo.cIntColour, shapeInfo.cIntAlpha, shapeInfo.sphSpecularity, shapeInfo.materialType)); //TOP CIRCLE
    }
    setPositions(circleContainer.children);
    return circleContainer;
}

function loadSawtoothCircleFilled(shapeInfo) {
    
    var circleContainer = new THREE.Object3D();
    
    //drawSineCircleGeometry(cx, cy, r, num_segments, cFreq, cAmps, intCol, intAlpha, extCol, extAlpha)
    for (var i = 0; i < Object.size(Pos); i++){

        circleContainer.add(drawSawToothCircle(0,0, shapeInfo.cRadius, shapeInfo.cNumSegments, shapeInfo.cFreq, shapeInfo.cAmps, shapeInfo.cIntColour, shapeInfo.cIntAlpha, 0, 0, shapeInfo.sphSpecularity, shapeInfo.materialType));
    }
    setPositions(circleContainer.children);

    return circleContainer;
}

function loadLinesOnly(shapeInfo){
    
    var linePos = [
        [0, (shapeInfo.sqWidthHeight - shapeInfo.sqThickness)/2], //Top
        [(shapeInfo.sqWidthHeight - shapeInfo.sqThickness)/2, 0], //left
        [0, -((shapeInfo.sqWidthHeight + shapeInfo.sqThickness)/2)], //bottom
        [-((shapeInfo.sqWidthHeight + shapeInfo.sqThickness)/2), 0] //right
    ];
    
    var lineContainer = [];
    
    for (var i = 0; i <  Object.size(Pos); i++){
        lineContainer.push(new Segment(shapeInfo.sqThickness, shapeInfo.sqThickness, 0xff00ff)); //create a smal one
        lineContainer[lineContainer.length - 1].setPos(linePos[i][0], linePos[i][1], 0.1);
        lineContainer[lineContainer.length - 1].addToScene(scene);
        lineContainer[lineContainer.length - 1].setVisible(false); //created but not rendered
    }
    
    return lineContainer;   
}

function redraw() {
    
    if (shapeInfo.cFillType === ShapeTypes.CIRCLE_FILLED) {
        shapes = loadCircles(shapeInfo);
    } else if (shapeInfo.cFillType === ShapeTypes.CIRCLE_OUTLINE) {
        shapes = loadCirclesOutline(shapeInfo);
    } else if (shapeInfo.cFillType === ShapeTypes.CIRCLE_SINE_FILLED) {
        shapes = loadSineCircleFilled(shapeInfo);
    } else if (shapeInfo.cFillType === ShapeTypes.CIRCLE_SINE_OUTLINE) {
        shapes = loadSineCircleOutline(shapeInfo);
    } else if (shapeInfo.cFillType === ShapeTypes.CIRCLE_GRID_MESH) {
        shapes = loadCircleGridMesh(shapeInfo);
    } else if (shapeInfo.cFillType === ShapeTypes.SPHERE_SPECULAR) {
        shapes = loadSpecularSpheres(shapeInfo);
    } else if (shapeInfo.cFillType === ShapeTypes.CIRCLE_FLUKE_MESH){
        shapes = loadFlukeCircle(shapeInfo);
        
    } else if (shapeInfo.cFillType === ShapeTypes.CIRCLE_TRIANGLE_FILLED){
        shapes = loadSawtoothCircleFilled(shapeInfo);
    } else if (shapeInfo.cFillType === ShapeTypes.SEMI_CIRCLE){
        shapes = loadSemiCircles(shapeInfo);
    } else if (shapeInfo.cFillType === ShapeTypes.RIGHT_TRIANGLE){
        shapes = loadRightTriangle(shapeInfo);
    
    } else {
        console.log("not a recognised shape type");
    }
    
    shapes.children[Pos.TOP].material.visible = drawTop;
    shapes.children[Pos.BOTTOM].material.visible = drawBottom;
    shapes.children[Pos.LEFT].material.visible = drawLeft;
    shapes.children[Pos.RIGHT].material.visible = drawRight;
    
    //    rotateShapes(shapes);
}

