

var Segment = function(w, h, colour){
    
    /*Height and width check*/
    if (isNaN(w) || w < 0){ w = 1; }
    if (isNaN(h) || h < 0){  h = 1; }
        
    var rectShape = new THREE.Shape();
    rectShape.moveTo( 0,0 );
    rectShape.lineTo( 0, h );
    rectShape.lineTo( w, h );
    rectShape.lineTo( w, 0 );
    rectShape.lineTo( 0, 0 );
    
    var geometry = new THREE.ShapeGeometry(rectShape);
    var material = new THREE.MeshBasicMaterial({color: colour});        
    this.mesh = new THREE.Mesh(geometry, material);
    
    this.ogW = w; 
    this.ogH = h;
    
    this.curWaveCoef = 0;
    this.waveInc = 0.05;
    this.lastWave = 0;
    
    /*DEBUG*/
    for (var i =0 ; i < geometry.vertices.length; i++){
        console.log(this.mesh.geometry.vertices[i]);
    }
    
    
    /*Priviledged methods - can see private and can be used by prototypes*/    
    this.getMesh = function(){ return this.mesh; }; 
}

/*GENERIC METHODS THAT YOU SHOULD PUT IN A SUPERCLASS*/
Segment.prototype.addToScene = function(scene){ scene.add(this.getMesh());  };
Segment.prototype.removeFromScene = function(scene){  scene.remove(this.getMesh()); };

Segment.prototype.growby = function(targetWidth, growX){    
    
    var growAmnt = this.getWave(targetWidth);      
    growAmnt *= 0.1;
        
    if (growX){
        this.mesh.position.x -= growAmnt;        
        this.mesh.geometry.vertices[2].x += growAmnt * 2; 
        this.mesh.geometry.vertices[3].x += growAmnt * 2;    
    } else {
        this.mesh.position.y -= growAmnt;        
        this.mesh.geometry.vertices[1].y += growAmnt * 2; 
        this.mesh.geometry.vertices[2].y += growAmnt * 2;            
    }
    
    this.mesh.geometry.verticesNeedUpdate = true; //Never more important       
};

Segment.prototype.setPos = function(x, y, z){    
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;
};



Segment.prototype.setVisible = function(visible){
    this.mesh.material.setValues({visible: visible});
};

Segment.prototype.setColor = function(colour){
    this.mesh.material.setValues({color: colour});
};


Segment.prototype.setSize = function(w, h){
    
    var tempPos = this.mesh.position;
    
    this.mesh.geometry.vertices[0].x = (this.ogW - w)/2; //left side bottom
    this.mesh.geometry.vertices[1].x = (this.ogW - w)/2; //left side top
    this.mesh.geometry.vertices[2].x = (this.ogW + w)/2; //right side top
    this.mesh.geometry.vertices[3].x = (this.ogW + w)/2; //right side bottom

    this.mesh.geometry.vertices[1].y = (this.ogH + h)/2; //left side top
    this.mesh.geometry.vertices[2].y = (this.ogH + h)/2; //right side top
    this.mesh.geometry.vertices[0].y = (this.ogH - h)/2; //left side bottom
    this.mesh.geometry.vertices[3].y = (this.ogH - h)/2; //right side bottom
    
    
        this.mesh.position = new THREE.Vector3(0,0,0);

//    this.mesh.geometry.verticesNeedUpdate = true;
    
    this.curWaveCoef = 0; //reset the wave
    
//    this.mesh.position = tempPos;
}

/*SUPER PRIVATE*/
Segment.prototype.getWave = function(value){
    
    this.curWaveCoef += this.waveInc;
    
    
    return (Math.sin(this.curWaveCoef) * value/2); //multiply to scale it then add half to make sure you stop at 0        
    
}