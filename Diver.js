function Diver(pos, world) {
    this.world = world;
    this.player = this.world.player;
    this.pos = pos;
    this.radius = 0.1;

    this.vel = vec(0);
    this.spd = 9;

    this.oxygen = 15;
    this.maxOxygen = 15;
    this.dead = false;
}

Diver.prototype.update = function (dt) {
    this.movement(dt);

    if(this.player.pos.sub(this.pos).length() < this.player.radius && !this.dead){
        this.player.diver = null;
        if(this.world.state == 5){
            this.world.state++;
            window.setTimeout(()=>{
                this.world.state++;
            }, 6000);
        }
    }

    this.oxygen -= dt;
    if(this.oxygen < 0){
        this.oxygen = 0;
        this.dead = true;
    }
}


Diver.prototype.movement = function (dt) {
    this.lastPos = this.pos.copy();

    const keyDir = vec(
        (KEYLIST["ArrowRight"] ? 1 : 0) - (KEYLIST["ArrowLeft"] ? 1 : 0),
        (KEYLIST["ArrowUp"] ? 1 : 0) - (KEYLIST["ArrowDown"] ? 1 : 0)
    ).normalize();

    const targetVel = this.dead ? vec(0) : keyDir.mul(this.spd);


    let notSubmergedArea = Math.min(Math.max(0, this.pos.y-CollisionMap.waterLevel(this.pos.x, this.world.time)), this.radius*2);
    if(notSubmergedArea > 0 && !this.dead){
        this.oxygen = this.maxOxygen;
    }
    this.vel.y -= 80*notSubmergedArea*dt;

    if(notSubmergedArea <= 0) this.vel = lerpDt(this.vel, targetVel, 0.96, 1, dt);
    this.pos = this.pos.add(this.vel.mul(dt));

    let d;
    for(let i = 0; i < 5; i++){
        let normal = CollisionMap.gradient(this.pos);
        let surfaceTowardsSdf = this.pos.sub(normal.mul(this.radius));
        d = CollisionMap.sdf(surfaceTowardsSdf);
        if(d < 0){
            this.pos = this.pos.add(normal.mul(-d*.5));
            for(let fish of this.world.fishes.fishes){
                //if(fish.pos.sub(this.pos).length() < 8*this.radius){
                    //fish.swarm = true;
                //}
            }
        }
    }

    this.vel = this.pos.sub(this.lastPos).mul(1/dt);
}