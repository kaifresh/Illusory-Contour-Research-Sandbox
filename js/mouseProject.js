
/* global THREE, scene, camera */

var projector = new THREE.Projector();

var geo = new THREE.BoxGeometry(10, 10, 1);
var mat = new THREE.MeshBasicMaterial();
var mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

console.log(shapes.children[1].position.z);
console.log(mesh.position.z);

$("#three-canvas").mousedown(function(){
    
//    
//    var viewW = window.innerWidth;//$("#three-canvas").innerWidth();
//    var viewH = window.innerHeight;//$("#three-canvas").innerHeight();
//    
//     var mouse3D = new THREE.Vector3( ( event.clientX / viewW ) * 2 - 1,   //x
//                                        -( event.clientY / viewH ) * 2 + 1,  //y
//                                        0 );                                            //z
//
//        projector.unprojectVector( mouse3D, camera );   
//        mouse3D.sub( camera.position ).normalize();               
////        mouse3D.normalize();
//        
//        
    var vector = new THREE.Vector3();
    var dir = new THREE.Vector3();
    var raycaster = new THREE.Raycaster();
    
    if ( camera instanceof THREE.OrthographicCamera ) {
        
        vector.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, - 1 ); // z = - 1 important!
        
        projector.unprojectVector( vector, camera );
                
        dir.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
        
        raycaster.set( vector, dir );
        
    } else if ( camera instanceof THREE.PerspectiveCamera ) {
        
        vector.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 ); // z = 0.5 important!
        
        vector.unproject( camera );
        
        raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
        
    }

//var intersects = raycaster.intersectObjects( objects, recursiveFlag );
//        var raycaster = new THREE.Raycaster( camera.position, mouse3D );
        var intersects = raycaster.intersectObjects( scene.children );
                
        console.log(intersects);
        // Change color if hit block
        if ( intersects.length > 0 ) {
            intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        }
    
});
