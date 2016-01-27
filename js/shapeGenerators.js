var SquareTypes = Object.freeze({SQUARE_SHARP: 0, SQUARE_GAUSSIAN: 1, SQUARE_BODGY: 2, TOTAL_SQUARETYPES: 3});

var ShapeTypes = Object.freeze({
    CIRCLE_FILLED: 0, 
    CIRCLE_OUTLINE: 1, 
    CIRCLE_SINE_FILLED: 2, 
    CIRCLE_SINE_OUTLINE: 3, 
    CIRCLE_GRID_MESH: 4, 
    SPHERE_SPECULAR: 5, 
    CIRCLE_FLUKE_MESH: 6, 
    CIRCLE_TRIANGLE_FILLED: 7,
    SEMI_CIRCLE: 8,
    RIGHT_TRIANGLE: 9,
    LINES_ONLY: 10
});

var MaterialTypes = Object.freeze({BASIC: 0, LAMBERT: 1, PHONG: 2});

/**************************************************/
/******************CIRCLES*************************/
/**************************************************/

function drawCircle(x, y, xRadius, yRadius, num_segments, fillColor, intAlpha, specularity, materialType){
    
    var curve = new THREE.EllipseCurve(
            0,  0,            // ax, aY
        xRadius, yRadius,           // xRadius, yRadius
    0,  2 * Math.PI,  // aStartAngle, aEndAngle
    false             // aClockwise
            );
    
    //var path = new THREE.Path( curve.getPoints( 50 ) );
    //var geometry = path.createPointsGeometry( 50 );
    var shape = new THREE.Shape( curve.getPoints( num_segments ) );
    var geometry = new THREE.ShapeGeometry(shape);
    
    //    var geometry = new THREE.CircleGeometry(radius, num_segments);
    
    var material = setMaterial(materialType, fillColor, intAlpha, specularity);
    var curCircle = new THREE.Mesh( geometry, material );
    curCircle.position.x = x;
    curCircle.position.y = y;
    curCircle.position.z = 2;
    
    return curCircle;
}

function drawCircleOutline(cx, cy, radius, fillColour, num_segments, intAlpha){
    
    if (num_segments < 5){
        num_segments = 5;
    }
    
    var theta = 2 * Math.PI / (num_segments - 1); //This -2 shit is totally bogus, but it works
    
    /*Initial positions*/
    var x = radius;
    var y = 0;
    
    /*This houses the vertices and other geometrical info*/
    var geometry = new THREE.Geometry();
    
    /*The surrounding circle fan*/
    for(var i = 0; i < num_segments; i++){
        
        x = radius * Math.sin(i * theta);
        y = radius * Math.cos(i * theta);
        
        geometry.vertices.push( new THREE.Vector3(x + cx, y + cy, 0));
    }
    
    var material = new THREE.LineBasicMaterial({color: fillColour, linewidth: 2, transparent: true, opacity: intAlpha});
    
    var outlineCircle = new THREE.Line(geometry, material, THREE.LineStrip);
    
    return outlineCircle;
}



function drawSpecularSphere(x, y, radius, num_segments, fillColor, intAlpha, specularity, materialType){
    
    var geometry = new THREE.SphereGeometry(radius, num_segments/2, num_segments/2);
    var material = setMaterial(materialType, fillColor, intAlpha, specularity);
    
    var curCircle = new THREE.Mesh( geometry, material );
    curCircle.position.x = x;
    curCircle.position.y = y;
    
    return curCircle;
}

function drawSemiCircle(x, y, r, fillColor, alpha, materialType, orientation){
    
    var startA, endA;
    
    if (orientation === Pos.TOP){
        startA = Math.PI * 0.5;
        endA = Math.PI * 1.5;
    } else if (orientation === Pos.BOTTOM){
        endA = Math.PI * 0.5;
        startA = Math.PI * 1.5;
    } else if (orientation === Pos.LEFT){
        startA = 0;
        endA = Math.PI;
    } else { //RIGHT, but catching all others 
        startA = Math.PI;
        endA = 0;
    }  
    
    
      var curve = new THREE.EllipseCurve(
            0,  0,            // ax, aY
        r, r,           // xRadius, yRadius
    startA,  endA,  // aStartAngle, aEndAngle
    false             // aClockwise
            );
    
    var shape = new THREE.Shape( curve.getPoints( 100 ) );
    var geometry = new THREE.ShapeGeometry(shape);
    
    var material = setMaterial(materialType, fillColor, alpha, 0);
    var curCircle = new THREE.Mesh( geometry, material );
    curCircle.position.x = x;
    curCircle.position.y = y;
    curCircle.position.z = 2;
    
    return curCircle;
    
}

function drawRightTriangle (x, y, opp, adj, fillColor, alpha, materialType, orientation){
    
    var flipper = -1;
    var aOffset = 0;
    var bOffset = 0;
    
//orientation = Pos.TOP;
    if (orientation === Pos.RIGHT){
        opp *= flipper;
        bOffset = (opp);
        
    } else if (orientation === Pos.LEFT){
        
        adj *= flipper;
        bOffset = (opp);
        
    } else if ( orientation === Pos.BOTTOM){ /*BOTOM IS REALLY THE TOP DUMMY*/

        aOffset = (adj);
//        opp *= flipper;
//        adj *= flipper;
        
    } else if ( orientation === Pos.TOP){
        aOffset = -(adj);
        opp *= flipper;
        adj *= flipper;
    }
    /*Dont need to do anything for the top*/
    
    
    
    
    /*Only two explicit lines are needed, as threejs interpolates the last point back tothe first for you.*/
    var shape = new THREE.Shape();
    
    shape.moveTo(-opp + aOffset,-adj + bOffset);
    shape.lineTo(-opp + aOffset, adj + bOffset);
    shape.lineTo( opp + aOffset, adj + bOffset);
    
    
    
    var geometry = new THREE.ShapeGeometry(shape);
    
    var material = setMaterial(materialType, fillColor, alpha, 0);
    var triangle = new THREE.Mesh( geometry, material );
    triangle.position.x = x;
    triangle.position.y = y;
    triangle.position.z = 2;
    
    return triangle;
    
    
    
}

/**************************************************/
/******************SINEWAVE CIRCLES****************/
/**************************************************/

function drawSineCircleGeometry(cx, cy, r, num_segments, cFreq, cAmps, intCol, intAlpha, extCol, extAlpha, specularity, materialType){
    
    /*cFreq comes from the slider, so this is cleaning the value so it produces only good looking shapes*/
    var maxVal = 10;
    var minVal = 2;
    cFreq = Math.round((cFreq/26) * maxVal); 
    cFreq = cFreq % 2 === 0 ? cFreq : ++cFreq;
    console.log("CFREQ: " + cFreq);

    /************************* Initial calculations *************************/
  
    num_segments = 1000;
    num_segments = Math.ceil(num_segments/cFreq); //FREQuency
    num_segments = num_segments % 2 === 0 ? num_segments : ++num_segments;
 
    if (num_segments <= 0){
        num_segments = 5;
    }
    
    var theta = 2 * Math.PI / num_segments; //This -2 shit is totally bogus, but it works
    
    /*Initial positions*/
    var x = r;
    var y = 0;
    
    /*Values for manipulating the sinewave displacement of the circle border*/
    var amps = r / cFreq;
    var sinDisplace = 0, xDisplace = 0, yDisplace = 0;
    
    /************************* Creating Geometry/Vertex Array *************************/
    
    //VertexArray circle(TrianglesFan, num_segments + 1);
    var geometry = new THREE.Geometry();
    
    /*This vertex geometry.vertices[0] is what all the faces will link back to*/
    var center = new THREE.Vector3(cx, cy, 0);
    geometry.vertices.push( center );  
    
    /************************* Inserting the vertices *************************/
    /*The surrounding circle fan*/
    for(var i = 0; i <= num_segments; i++){
        
        x = r * Math.cos(i * theta);
        y = r * Math.sin(i * theta);
        
        sinDisplace = Math.sin(i * Math.PI / cFreq) * amps * cAmps;
        sinDisplace -= amps * cFreq;
        
        yDisplace = (r + sinDisplace) * (y/r);
        xDisplace = (r + sinDisplace) * (x/r);
        
        //        circle[i].position = Vector2f(x + cx + xDisplace, y + cy + yDisplace); //output vertex
        var vertex = new THREE.Vector3();
        vertex.x = x + cx + xDisplace;
        vertex.y = y + cy + yDisplace;
        geometry.vertices.push( vertex );
        
        /*Exterior Color*/
        //circle[i].color = Color(outline.r, outline.g, outline.b, extAlpha);
    }
    
    /************************* Inserting Faces *************************/
    
    // components of the position vector for each vertex are stored
    // contiguously in the buffer.
    
    var n = new THREE.Vector3( 0, 0, 1); //These are the normals! I dont really get it
    
    for ( i = 1; i <= num_segments; i ++ ) {
        
        var v1 = i;
        var v2 = i + 1 ;
        var v3 = 0;
        
        geometry.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) ); //Face3( a, b, c, normal, color, materialIndex )
        //this.faceVertexUvs[ 0 ].push( [ uvs[ i ], uvs[ i + 1 ], centerUV ] );
    }
    //circle[num_segments] = circle[1];
    
    //    var material = new THREE.MeshBasicMaterial({color: intCol, transparent: true, opacity: intAlpha});
    var material = setMaterial(materialType, intCol, intAlpha, specularity);
    
    
    var mesh = new THREE.Mesh(geometry, material);
    
    return mesh;
    
    
}

function drawSineCircleOutline(cx, cy, r, num_segments, cFreq, cAmps, outline, extAlpha ){
    
    /************************* Initial calculations *************************/
    
    num_segments = 100;
//    if (num_segments <= 0){
//        num_segments = 5;
//    }
    
    var theta = 2 * Math.PI / num_segments; //This -2 shit is totally bogus, but it works
    
    /*Initial positions*/
    var x = r;
    var y = 0;
    
    /*Values for manipulating the sinewave displacement of the circle border*/
    var amps = r / cFreq;
    var sinDisplace = 0, xDisplace = 0, yDisplace = 0;
    
    /************************* Creating Geometry/Vertex Array *************************/
    
    //VertexArray circle(TrianglesFan, num_segments + 1);
    var geometry = new THREE.Geometry();
    
    
    /************************* Inserting the vertices *************************/
    /*The surrounding circle fan*/
    for(var i = 0; i <= num_segments; i++){
        
        x = r * Math.cos(i * theta);
        y = r * Math.sin(i * theta);
        
        sinDisplace = Math.sin(i * Math.PI / cFreq) * amps * cAmps;
        sinDisplace -= amps * cFreq;
        
        yDisplace = (r + sinDisplace) * (y/r);
        xDisplace = (r + sinDisplace) * (x/r);
        
        //        circle[i].position = Vector2f(x + cx + xDisplace, y + cy + yDisplace); //output vertex
        var vertex = new THREE.Vector3();
        vertex.x = x + cx + xDisplace;
        vertex.y = y + cy + yDisplace;
        geometry.vertices.push( vertex );
    }   
    
    var material = new THREE.LineBasicMaterial({color: outline, transparent: true, opacity: extAlpha});
    //material.opacity = 0;
    
    var mesh = new THREE.Line(geometry, material);
    
    return mesh;
    
}
/************ SAW TOOTH CIRCLE ************/
function drawSawToothCircle(cx, cy, r, num_segments, cFreq, cAmps, intCol, intAlpha, extCol, extAlpha, specularity, materialType){
    
    num_segments = 400;    
    /*Num_segments neeeds to be a round integer otherwise you get glitchy */
    num_segments = Math.ceil(num_segments/cFreq); //FREQuency
    num_segments = num_segments % 2 === 0 ? num_segments : ++num_segments;
    
    cAmps *= 2;

    /************************* Initial calculations *************************/    
    if (num_segments <= 0){
        num_segments = 5;
    }
    
    var theta = (2 * Math.PI) / num_segments ; //This -2 shit is totally bogus, but it works
    
    /*Initial positions*/
    var x = r;
    var y = 0;

    /************************* Creating Geometry/Vertex Array *************************/
    
    var geometry = new THREE.Geometry();
    
    /*This vertex geometry.vertices[0] is what all the faces will link back to*/
    var center = new THREE.Vector3(cx, cy, 0);
    geometry.vertices.push( center );  
    
    /************************* Inserting the vertices *************************/
        
    /*The surrounding circle fan*/
    for(var i = 0; i <= num_segments; i++){
        
        x = r * Math.cos(i * theta);
        y = r * Math.sin(i * theta);

        if (i % 2 === 0){            
                x += cAmps * Math.cos(i * theta); 
                y += cAmps * Math.sin(i * theta);
        }

        //        circle[i].position = Vector2f(x + cx + xDisplace, y + cy + yDisplace); //output vertex
        var vertex = new THREE.Vector3();
        vertex.x = x + cx;//+ xDisplace;
        vertex.y = y + cy;//+ yDisplace;
        geometry.vertices.push( vertex );
        
        /*Exterior Color*/
        //circle[i].color = Color(outline.r, outline.g, outline.b, extAlpha);
    }
    
    /************************* Inserting Faces *************************/
    
    // components of the position vector for each vertex are stored
    // contiguously in the buffer.
    
    var n = new THREE.Vector3( 0, 0, 1); //These are the normals! I dont really get it
    
    for ( i = 1; i <= num_segments; i ++ ) {
        
        var v1 = i;
        var v2 = i + 1 ;
        var v3 = 0;
        
        geometry.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) ); //Face3( a, b, c, normal, color, materialIndex )
        //this.faceVertexUvs[ 0 ].push( [ uvs[ i ], uvs[ i + 1 ], centerUV ] );
    }
//    geometry.faces.push( new THREE.Face3(num_segments - 1, num_segments, 0, [ n, n, n ]));
    //circle[num_segments] = circle[1];
    
    //    var material = new THREE.MeshBasicMaterial({color: intCol, transparent: true, opacity: intAlpha});
    var material = setMaterial(materialType, intCol, intAlpha, specularity);
 
    var mesh = new THREE.Mesh(geometry, material);
    
    return mesh;   
}


/**************************************************/
/******************MESHES!*********************/
/**************************************************/

function drawCircleGridMesh( cx,  cy,  r,  num_segments, outline,  extAlpha){
    
    num_segments = 100;
    /*Vertex Arrays for lines must be divisible by two as you need an end and start point*/
    if (num_segments % 2 === 1){
        num_segments++;
    }
    
    if (num_segments > 80){
        num_segments = 100;
    } else if (num_segments > 32){
        num_segments = 60; 
    } else {
        num_segments = 32;
    }
    
    /*Init the trig values*/
    var theta = 2 * Math.PI / num_segments;
    var tangetial_factor = Math.tan(theta);//calculate the tangential factor
    var radial_factor = Math.cos(theta);//calculate the radial factor
    
    var x = r;    //we start at angle = 0
    var y = 0;
    
    /*Initialise the array - you have as many boxes as segments, so just use that*/
    var meshPositions = new Array(num_segments);//[2][num_segments];
    
    /*Create all the points of a circle*/    
    for(var i = 0; i < num_segments; i++){
        meshPositions[i] = new Array(2);        //Create a new [x][y] entry for each line
        meshPositions[i][0] = x + cx;
        meshPositions[i][1] = y + cy;
        
        var tx = -y; //Trig trickery
        var ty = x;
        
        //add the tangential vector
        x += tx * tangetial_factor;
        y += ty * tangetial_factor;
        
        //correct using the radial factor
        x *= radial_factor;
        y *= radial_factor;
    }
    
    /*Now for the rub:
     Use lines to connect the points you created earlier in a way that forms some spokes
     */
    
    var lineStart = 0;
    var lineEnd = num_segments-1;
    
    /*
     * SOOOO This is a replacement for SFML's vertex array. 
     * Object3D() can be used as a container, so we're just making a tonne of
     * individual lines and adding them, then treating the entire container as a shape.
     * 
     * The reason we can't just use all the vertices, is that the "line" method
     * in THREE.JS creates lines between every single vertex
     * (whereas in SFML, you have line (pairs of 2) OR linestrip (connect every vertex))
     */
//    var meshCircle = new THREE.Object3D();
        var geometry = new THREE.Geometry();

    
    /*Lines are defined by 2 vertices. These two vertices are handled by vaStep, which increments twice per loop. So you only need to do n/2 repeats.*/
    for (var i = 0; i < num_segments; i++){
        
        
        /*Start of line i*/
        geometry.vertices.push(new THREE.Vector3(meshPositions[lineStart][0], meshPositions[lineStart][1], 0));
        
        /*End of line i*/
        geometry.vertices.push(new THREE.Vector3(meshPositions[lineEnd][0], meshPositions[lineEnd][1], 0));
        
        
//        /*Here is where we add each line to the Object3D*/
//        meshCircle.add(individualLine);
        
        /*Whats going on here?
         This is a switch which defines how lineStart & lineEnd move around the circle
         When the switch gets called, new starting positions are specified for these two position indexes.
         */
        if (i === Math.ceil(num_segments/2)){
            lineStart = num_segments *.75;
            lineEnd = num_segments *.75 - 1;
        }
        /*Just think of it like pointer arithmetic for the array containing circle points*/
        lineStart = ++lineStart % num_segments;
        lineEnd--;
    }
    
//        var individualLine = new THREE.Line(geometry, material);
        var material = new THREE.LineBasicMaterial({color: outline, transparent: true});
        var meshCircle = new THREE.Line(geometry, material, THREE.LinePieces);

    return meshCircle;
}

function drawFlukeTexture (cx, cy, r, colour, alpha, specularity, material){
   
   r *= 2.3;
   
    var geometry = new THREE.PlaneGeometry(r, r);
    var material = setMaterial(material, colour, alpha, specularity);
    material.setValues({map: shapeInfo.cFlukeTexture}); //TEXTURE HAS BEEN PRELOADED IN INITSHAPEINFO
    var plane = new THREE.Mesh(geometry, material);
    
    plane.position.x = cx;
    plane.position.y = cy;
    
    return plane;
}

function drawPacMan (x, y, radius, fillColor, intAlpha){
    
    var num_segments = 97; /*This just creates a 90 degree pacman*/
    var theta = 2 * Math.PI / (num_segments - 1); //This -2 shit is totally bogus, but it works
    
    var pacManPts = [];
    /*The round bit of the pacman*/
    for(var i = 0; i < num_segments * 0.75; i++){
        
        var nextX = x + (radius * Math.sin(i * theta));
        var nextY = y + (radius * Math.cos(i * theta));
        
        pacManPts.push( new THREE.Vector2( nextX, nextY ) );
    }
    
    /*Go back to the center. 
     * The beautiful thing is the shapes class connects the last point to the first point for you anyway! SO you're already done!!*/
    pacManPts.push( new THREE.Vector2( x, y ) );
    
    /*Shape --> Geometry + Mesh = Pacmyyyaaaan*/
    var pacManShape = new THREE.Shape( pacManPts );
    var geometry = new THREE.ShapeGeometry( pacManShape );
    var material = new THREE.MeshBasicMaterial({color: fillColor, transparent: true, opacity: intAlpha});
    
    var pacMyaaaan = new THREE.Mesh(geometry, material);
    
    return pacMyaaaan;   
}

function drawKaniza (colour, radius) {
       
//       http://stackoverflow.com/questions/2647867/how-to-determine-if-variable-is-undefined-or-null
    if(typeof colour === 'undefined'){
        colour = 0xffffff
    };
    if(typeof radius === 'undefined'){
        radius = 10
    };
       
    /*FUCKED BUT TRUE...
     * 
     * So apparently the rotational pivot for these shapes is (0,0) i.e. the center of the scene. 
     * If you want to rotate sometihng, it is going to rotate AROUND (0,0) and thus also move. 
     * So obviously you want to change the axis of rotation. To do this I think you have to use THREE.SceneUtils.xxxxxx 
     * Have to look into it
     * */
    
    var kanizaSquare = new THREE.Object3D();
    
    var sqDist = shapeInfo.sqWidthHeight/2;    
    
    /*It is agonisingly crucial that the rotation come BEFORE the translation....*/
    
    //BOTTOM LEFT
    kanizaSquare.add(drawPacMan (0,0, radius, colour, 1));
    kanizaSquare.children[0].rotation.z = Math.PI * 1.5;
    kanizaSquare.children[0].position.x = -sqDist;
    kanizaSquare.children[0].position.y = -sqDist;
    
    //TOP RIGHT
    kanizaSquare.add(drawPacMan (0,0, radius, colour, 1));   
    kanizaSquare.children[1].rotation.z = Math.PI * 0.5;
    kanizaSquare.children[1].position.x = sqDist;
    kanizaSquare.children[1].position.y = sqDist;
    
    //TOP LEFT 
    kanizaSquare.add(drawPacMan (0,0, radius, colour, 1));
    kanizaSquare.children[2].rotation.z = Math.PI * 1;
    kanizaSquare.children[2].position.x = -sqDist;
    kanizaSquare.children[2].position.y = sqDist;
    
    //BOTTOM RIGHT --> NO ROTATION REQUIRED
    kanizaSquare.add(drawPacMan (0,0, radius, colour, 1));    
    kanizaSquare.children[3].position.x = sqDist;
    kanizaSquare.children[3].position.y = -sqDist;
    
    return kanizaSquare;
}


/**************************************************/
/******************THE SQUARE!*********************/
/**************************************************/

function drawOutlineSquareWithMovableEdges(x, y, w, h, extColour, thickness, gapSize){

    if (gapSize >= w/2){    
        gapSize = w/2;
    }
    var outlineSquare = new THREE.Object3D();
    
    /*CREATE FOUR IDENTICAL SEGMENTS*/
    for (var i = 0; i < 8; i++){

        var material = new THREE.MeshBasicMaterial({ color: extColour });

        var geometry = new THREE.BoxGeometry(w/2 + thickness/2 - gapSize, thickness, 0);
        var currentSegment = new THREE.Mesh(geometry, material);        
        
        outlineSquare.add(currentSegment);
    }
    
    /*ARRANGE THOSE SEGMENTS INTO A BOX*/
    //TOP LEFT
    outlineSquare.children[0].position.y += h/2;
    outlineSquare.children[0].position.x -= w/4;
    //TOP RIGHT
    outlineSquare.children[1].position.y += h/2;
    outlineSquare.children[1].position.x += w/4;
    //BOTTOM LEFT
    outlineSquare.children[2].position.y -= h/2;
    outlineSquare.children[2].position.x -= w/4;
    //BOTTOM RIGHT
    outlineSquare.children[3].position.y -= h/2;
    outlineSquare.children[3].position.x += w/4;
   
   
   
    //LEFT TOP
    outlineSquare.children[4].rotation.z = Math.PI * 0.5; //(Rotation in radians)
    outlineSquare.children[4].position.x -= w/2;
    outlineSquare.children[4].position.y += h/4;
        
    //LEFT BOTTOM
    outlineSquare.children[5].rotation.z = Math.PI * 0.5; //(Rotation radians)
    outlineSquare.children[5].position.x -= w/2;
    outlineSquare.children[5].position.y -= h/4;
    //RIGHT TOP
    outlineSquare.children[6].rotation.z = Math.PI * 0.5;
    outlineSquare.children[6].position.x += w/2;
    outlineSquare.children[6].position.y += h/4;
    //RIGHT BOTTOM
    outlineSquare.children[7].rotation.z = Math.PI * 0.5;
    outlineSquare.children[7].position.x += w/2;
    outlineSquare.children[7].position.y -= h/4;
    
    /*ACCOMODATE TEH GAPSIZE!!*/
    var partialGap = gapSize/2;
    var partialThick = thickness/4;
    
    for ( var i = 0; i < 4; i++){
        partialGap *= -1;  //Flips it for top & bottom segments
        partialThick *= -1;
        outlineSquare.children[i].position.x += partialGap + partialThick;
    }
    for ( var i = 4; i < 8; i++){
       partialGap *= -1;  //Flips it for top & bottom segments
        partialThick *= -1;
        outlineSquare.children[i].position.y -= partialGap + partialThick;
    }
    
    //POSITION ALL SEGMENTS (ie the box)
    outlineSquare.position.x = x;
    outlineSquare.position.y = y;

    return outlineSquare;
}

function drawFilledSquare(x, y, w, h, extColour){
 
    var material = new THREE.MeshBasicMaterial( {color: extColour} );
    var geometry = new THREE.BoxGeometry(w, h, 0);
    var filledSquare = new THREE.Mesh(geometry, material);        
    
    filledSquare.position.x = x; 
    filledSquare.position.y = y;
    
    /*This is only so that user controls which leverage off object3d functionality 
     * for the outline square work in the same way for the filled square*/
    var container = new THREE.Object3D();
    container.add(filledSquare);
    
    return container;
}



function setMaterial(materialType, colour, transparency, specularity){
    
    if (materialType === MaterialTypes.BASIC){
        return new THREE.MeshBasicMaterial( { color: colour, shininess: specularity, transparent: true,  opacity: transparency} );
    } else if (materialType === MaterialTypes.LAMBERT){
        return new THREE.MeshLambertMaterial( { color: colour,  shininess: specularity, transparent: true, opacity: transparency} );
    } else if (materialType === MaterialTypes.PHONG){
        return new THREE.MeshPhongMaterial( { color: colour,  shininess: specularity, transparent: true, opacity: transparency} );
    } else {
        return new THREE.MeshBasicMaterial( {color: Math.random() * 0xFFFFFF});
    }
    
}
