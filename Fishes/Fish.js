function Fish(pos, world){
    this.world = world;
    this.pos = pos;
    this.radius = 0.15;
    this.computeScale();

    this.vel = vec(0);
    this.spd = 5;

    this.swarm = false;
    this.seed = Math.random()*10000;
}

Fish.prototype.computeScale = function(){
    this.scale = vec(this.radius*4);
}

Fish.prototype.update = function(dt, fishes){
    if(KEYLIST["KeyT"]){
        this.swarm = !this.swarm;
    }
    this.movement(dt, fishes);
}

Fish.prototype.movement = function (dt, fishes) {
    this.lastPos = this.pos.copy();


    let targetVel;
    let dp = this.world.player.pos.sub(this.pos);

        let avoidVector = vec(0);
        let alignDir = vec(0);
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
                if(/*d.normalize().dot(this.vel.normalize()) > -.2 &&*/ d.length() < 20*this.radius){
                    avoidVector = avoidVector.add(d.normalize().mul(1/(d.length()+0.1)));
                }
                if(d.mul(-1).normalize().dot(this.vel.normalize()) > -.2  && d.length() < 35*this.radius){
                    alignDir = alignDir.add(fish.vel.normalize());
                }
                if(d.length() < 30*this.radius && fish.swarm){
                    this.swarm = true;
                }
            }
        }
    alignDir = alignDir.normalize();
    if(this.swarm){
            //console.log(avoidVector);
        targetVel = dp.normalize().add(avoidVector.mul(5)).add(alignDir.mul(5)).normalize().mul(this.spd);
    } else {
        let speed = this.spd*0.4;
        if(dp.length() < this.world.player.radius*3){
            avoidVector = avoidVector.add(dp.normalize().mul(-1));
            speed = this.spd*1.5;
        }
        targetVel = vec(noise(vec(this.seed+this.world.time))*2-1, noise(vec(this.seed*2+this.world.time))*2-1).normalize().add(avoidVector.mul(4)).normalize().mul(speed);
        //console.log(targetVel);
    }




    let notSubmergedArea = Math.max(0, this.pos.y-CollisionMap.waterLevel(this.pos.x, this.world.time));
    this.vel.y -= 80*notSubmergedArea*this.radius*dt;

    if(notSubmergedArea <= 0) this.vel = lerpDt(this.vel, targetVel, 0.96, 1, dt);
    this.pos = this.pos.add(this.vel.mul(dt));

    if(dp.length() < this.radius+this.world.player.radius){
        this.pos = this.world.player.pos.sub(dp.normalize().mul(this.radius+this.world.player.radius));
        if(this.swarm) this.world.player.vel = this.world.player.vel.add(dp.normalize().mul(this.world.player.spd*2));
    }

    let d;
    for(let i = 0; i < 5; i++){
        let normal = CollisionMap.gradient(this.pos);
        let surfaceTowardsSdf = this.pos.sub(normal.mul(this.radius));
        d = CollisionMap.sdf(surfaceTowardsSdf);
        if(d < 0){
            this.pos = this.pos.add(normal.mul(-d*.5));
        } else {
            break;
        }
    }

    this.vel = this.pos.sub(this.lastPos).mul(1/dt);
}