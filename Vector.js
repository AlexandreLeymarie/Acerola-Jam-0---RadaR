function Vector(x, y){
    this.x = x;
    this.y = y;
}

Vector.prototype.copy = function(){
    return new Vector(this.x, this.y);
}

Vector.prototype.equals = function(v){
    return this.x == v.x && this.y == v.y;
}

Vector.prototype.add = function(v){
    return new Vector(this.x+v.x, this.y+v.y);
}


Vector.prototype.sub = function(v){
    return new Vector(this.x-v.x, this.y-v.y);
}


Vector.prototype.mul = function(l){
    return new Vector(this.x*l, this.y*l);
}

Vector.prototype.dot = function(v){
    return this.x*v.x+this.y*v.y;
}

Vector.prototype.length = function(){
    if(this.l === undefined) this.l = Math.sqrt(this.x*this.x+this.y*this.y);
    return this.l;
}

Vector.prototype.normalize = function(){
    if(this.n === undefined){
        let l = this.length();
        if(l == 0) return this.copy();
        this.n = this.mul(1/l);
    }
    return this.n;
}

Vector.prototype.reflection = function(n){
    return this.add(n.mult(-2*this.dot(n)));
}

Vector.prototype.xx = function(){
    return new Vector(this.x, this.x);
}

Vector.prototype.yy = function(){
    return new Vector(this.y, this.y);
}

Vector.prototype.xy = function(){
    return new Vector(this.x, this.y);
}

Vector.prototype.yx = function(){
    return new Vector(this.y, this.x);
}

function vec(x, y){
    if(x === undefined) return new Vector(0, 0);
    return new Vector(x, y !== undefined ? y : x);
}