function Submarine(pos, world){
    this.pos = pos;
    this.world = world;
    this.vel = vec(0);
    this.radius = 1;
    this.linkLength = 3.5;
    this.linked = false;
}

Submarine.prototype.update = function(dt){
    this.lastPos = this.pos.copy();


    let notSubmergedArea = Math.min(Math.max(0, this.pos.y-CollisionMap.waterLevel(this.pos.x, this.world.time)), this.radius*2);
    this.vel.y -= 25*notSubmergedArea*this.radius*dt;



    this.vel = this.vel.mul(Math.pow(0.05, dt));
    this.pos = this.pos.add(this.vel.mul(dt));


    let dp = this.world.player.pos.sub(this.pos);
    if(dp.length() < this.radius+this.world.player.radius){
        let m = this.pos.add(dp.mul(0.5));
        this.pos = m.sub(dp.normalize().mul(this.radius));
        this.world.player.pos = m.add(dp.normalize().mul(this.world.player.radius));
    }

    if(this.linked && dp.length() > this.linkLength){
        let tmp = this.world.player.pos;
        this.pos = tmp.sub(dp.normalize().mul(this.linkLength));
        //this.world.player.vel = this.world.player.vel.mul(Math.pow(0.9, dt));
    }

    if(!this.linked && dp.length() <= this.linkLength){
        this.linked = true;
        this.world.player.spd *= 0.8;
        this.world.player.linked = true;
        for(let fish of this.world.fishes.fishes){
            //if(fish.pos.sub(this.pos).length() < 16*this.radius){
                fish.swarm = true;
            //}
        }
    }

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