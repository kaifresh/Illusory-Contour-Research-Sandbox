
var DotProbe = function(parent, hidden){
    
    this.div = $("<div>", {id: "dotProbe", class: "dotProbe"});
  
    parent.append(this.div);    
    this.parent = parent;
  
    $(this.div).css({
        width: '8px', 
        height: '8px',
        position: 'absolute',
        top: '0',
        left:'0',
        background: "rgb(0,255,0)",
        content: ' ',
        'z-index': '10000000'      
    });   
  
    if (hidden){
        $(this.div).hide();
    }  
};

DotProbe.prototype.trackMouse = function(){
    
    console.log("LOL", this.parent)
    console.log("DIV", $(this.div) );
    
    var divPtr = $(this.div); //Need a pointer because its context gets lost inside the mouselistener closure
    
    this.listener = function(event){                               
        divPtr.css({
            top: event.clientY,
            left: event.clientX
        });
    };            
            
    $(this.parent).on('mousemove', this.listener);
    
    
    console.log("LISTENNNER: ", this.listener);
    
};

/*This is a shitty implementation as it kills ALL mousemoves off the canvas...*/
DotProbe.prototype.stopTrackingMouse = function(){            
    $(this.parent).unbind("mousemove", this.listener);
};


DotProbe.prototype.flashAtFor = function(x, y, duration){
    
    $(this.div).css({
        top: y,
        left: x
    });
    
    $(this.div).show();
    
    var divPtr = $(this.div);   
    setTimeout(function(){
        divPtr.hide();
    }, duration);

};

DotProbe.prototype.hide = function(){
    $(this.div).hide();
};

DotProbe.prototype.show = function(){
    $(this.div).show();
};