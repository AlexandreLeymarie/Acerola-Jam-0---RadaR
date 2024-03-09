function Fish(pos){
    this.pos = pos;
    this.radius = 0.5;
    this.computeScale();
}

Fish.prototype.computeScale = function(){
    this.scale = vec(this.radius*2);
}