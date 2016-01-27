/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//function drawCircle(x, y, xRadius, yRadius, num_segments, fillColor, intAlpha, specularity, materialType){
var Tracer = function(){
    
    var _mesh = drawCircle(0,0, shapeInfo.cRadius * 0.05, shapeInfo.cRadius * 0.05, 50, 0xFFFFFF, 1, 0, MaterialTypes.BASIC);
    var _bupMesh;
    
    this.position = Pos.TOP;
        
    /*Priviledged methods - can see private and can be used by prototypes*/    
    this.getMesh = function(){ return _mesh; }; /* 'priviledged methods' A TRICK TO DO W SCOPE : http://stackoverflow.com/questions/436120/javascript-accessing-private-member-variables-from-prototype-defined-functions*/
    this.setMesh = function(newMesh){
        _bupMesh = _mesh;
        _mesh = newMesh;
    };
    
    this.setMeshPos = function (x, y, z){
        if (x !== undefined && x !== null){
            _mesh.position.x = x; 
        }
        
        if (y !== undefined && y !== null){
            _mesh.position.y = y; 
        }
        
        if (z !== undefined && z !== null){
            _mesh.position.z = z; 
        }
    };
    
    this._toggleVisibility = function(){ _mesh.visible = _mesh.visible ? false : true;};
};

/**************************THE BOOK OF GENESIS**************************/
/**************************THE BOOK OF GENESIS**************************/
/**************************THE BOOK OF GENESIS**************************/
Tracer.prototype.setNewMesh = function(newMesh){ this.setMesh(newMesh); };
Tracer.prototype.setMeshColor = function(color){
    var temp = this.getMesh();
    temp.material.setValues({color: color});
    this.setMesh(temp);
};

Tracer.prototype.addToScene = function(scene){ scene.add(this.getMesh());  };
Tracer.prototype.removeFromScene = function(scene){  scene.remove(this.getMesh()); };

Tracer.prototype.toggleVisibility = function() { this._toggleVisibility(); };

/*** Positioning the Mesh ***/
Tracer.prototype.setPositionRelativeTo = function(discMesh, centerSquare, pos){
        
    var bbox = new THREE.Box3();
    bbox.setFromObject(centerSquare);
    
    var discBB = new THREE.Box3();
    discBB.setFromObject(discMesh);
    
    var offset = (discBB.max.x - discBB.min.x) * 0.4; //Calculated relative to a disk (i..e local coords not global so it doesnt matter which you do it for)

    if (pos === Pos.LEFT){
        
        var curDist = discMesh.position.x - bbox.min.x;
        
        var tracerPos = (bbox.min.x - curDist) - offset;
        
        this.setMeshPos(tracerPos, null, 3);
    } 
    
    else if (pos === Pos.RIGHT){
        var curDist = bbox.max.x - discMesh.position.x;
        
        var tracerPos = (bbox.max.x + curDist) + offset;
        
        this.setMeshPos(tracerPos, null, 3);
    }
    
    /*THESE ARE FLIPPED!!! THIS IS REALLY THE BOTTOM*/
     else if (pos === Pos.TOP){
        var curDist = bbox.min.y - discMesh.position.y;
        
        var tracerPos = (bbox.min.y + curDist) - offset;
        
        this.setMeshPos(null, tracerPos, 3);
    }
    
    /*THESE ARE FLIPPED!!! THIS IS REALLY THE TOP*/
     else if (pos === Pos.BOTTOM){
        var curDist = discMesh.position.y + bbox.min.y;
        
        var tracerPos = (bbox.max.y - curDist) + offset;
        
        this.setMeshPos(null, tracerPos, 3);
    }    
};


function drawTracers(){
    
    var tracerVect = [];
    
    for (var i = 0; i <= Pos.RIGHT; i++){
        tracerVect.push(new Tracer());
        tracerVect.last().addToScene(scene);
    }
    return tracerVect;
}

function toggleTracers(tracerVect){
    for (var i = 0; i < tracerVect.length; i++){
        tracerVect[i].toggleVisibility();
    }
}