/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

//http://stackoverflow.com/questions/9050345/selecting-last-element-in-javascript-array
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

window.performance = window.performance || {};

performance.now = (function() {
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         function() { return new Date().getTime(); };
})();

function cartX(screenX, screen_width){
    return screenX - screen_width/2;
}

function cartY(screenY, screen_height){
   return screenY - screen_height/2;
}

function screenToWorld(event, camera){
    
    var vector = new THREE.Vector3();
    
    vector.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
    - ( event.clientY / window.innerHeight ) * 2 + 1,
    0.5 );
    
    //vector.unproject( camera );
    
    var dir = vector.sub( camera.position ).normalize();
    
    var distance = - camera.position.z / dir.z;
    
    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
    return pos;
}

function generateTexture() {

	var size = 512;

	// create canvas
	canvas = document.createElement( 'canvas' );
	canvas.width = size;
	canvas.height = size;

	// get context
	var context = canvas.getContext( '2d' );

	// draw gradient
	context.rect( 0, 0, size, size );
	var gradient = context.createLinearGradient( 0, 0, size, size );
	gradient.addColorStop(0, '#ffffff'); // White 
	gradient.addColorStop(1, 'transparent'); // dark blue
	context.fillStyle = gradient;
	context.fill();

	return canvas;

}

/* http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format */
// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}


function goFullScreen(){
    var elem = document.getElementsByTagName("BODY")[0];
    
    /*FOR FULL SCREEN DISPLAYS --> http://stackoverflow.com/questions/13303151/getting-fullscreen-mode-to-my-browser-using-jquery AND https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode */
    req = elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen;
    req.call(elem);
    
}