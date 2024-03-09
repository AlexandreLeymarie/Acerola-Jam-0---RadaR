function Fish(pos, world){
    this.world = world;
    this.pos = pos;
    this.radius = 0.15;
    this.computeScale();

    this.vel = vec(0);
    this.spd = 5;
}

Fish.prototype.computeScale = function(){
    this.scale = vec(this.radius*2);
}

Fish.prototype.update = function(dt, fishes){
    this.movement(dt, fishes);
}

Fish.prototype.movement = function (dt, fishes) {
    this.lastPos = this.pos.copy();



    let avoidVector = vec(0);
    let seenFishes = [];
    for(let i = 0; i < 50; i++){
        let ind;
        do{
            ind = Math.floor(Math.random()*fishes.length);
        }while(seenFishes.includes(ind));
        let fish = fishes[ind];
        seenFishes.push(ind);

        if(fish != this){
            let d = this.pos.sub(fish.pos);
            if(d.length() < 10*this.radius){
                avoidVector = avoidVector.add(d.normalize().mul(1/(d.length()+0.1)));
            }
        }
    }

        //console.log(avoidVector);
    let targetVel = this.world.player.pos.sub(this.pos).normalize().add(avoidVector.mul(4)).normalize().mul(this.spd);
    


    let notSubmergedArea = Math.max(0, this.pos.y);
    this.vel.y -= 60*notSubmergedArea*this.radius*dt;

    this.vel = lerpDt(this.vel, targetVel, 0.8, 1, dt);
    this.pos = this.pos.add(this.vel.mul(dt));

    let d;
    for(let i = 0; i < 5; i++){
        let normal = CollisionMap.gradient(this.pos);
        let surfaceTowardsSdf = this.pos.sub(normal.mul(this.radius));
        d = CollisionMap.sdf(surfaceTowardsSdf);
        if(d < 0){
            this.pos = this.pos.add(normal.mul(-d*.5));
        }
    }

    this.vel = this.pos.sub(this.lastPos).mul(1/dt);
}