function Fish(pos, world){
    this.world = world;
    this.pos = pos;
    this.radius = 0.1;
    this.interactionsRadius = 0.15;
    this.computeScale();

    this.spd = 5;
    this.vel = vec(Math.random()-.5, Math.random()-.5).normalize().mul(this.spd);

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

    let playerTarget = this.world.player.diver ? this.world.player.diver : this.world.player;

    let targetVel;
    let dp = playerTarget.pos.sub(this.pos);

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
                if(/*d.normalize().dot(this.vel.normalize()) > -.2 &&*/ d.length() < 20*this.interactionsRadius){
                    avoidVector = avoidVector.add(d.normalize().mul(1/(d.length()+0.1)));
                }
                if(d.mul(-1).normalize().dot(this.vel.normalize()) > -.2  && d.length() < 35*this.interactionsRadius){
                    alignDir = alignDir.add(fish.vel.normalize());
                }
                if(d.length() < 30*this.interactionsRadius && fish.swarm){
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
        if(dp.length() < playerTarget.radius*3){
            avoidVector = avoidVector.add(dp.normalize().mul(-1));
            speed = this.spd*1.5;
        }
        targetVel = this.vel.add(vec(noise(vec(this.seed+this.world.time))*2-1, .25*(noise(vec(this.seed*2+this.world.time))*2-1)).normalize().mul(.3)).add(avoidVector.mul(5)).add(alignDir.mul(5)).normalize().mul(speed);
        /*targetVel = vec(noise(vec(this.seed+this.world.time))*2-1, noise(vec(this.seed*2+this.world.time))*2-1).normalize().add(avoidVector.mul(4)).add(alignDir.mul(10)).normalize().mul(speed);*/
        //console.log(targetVel);
    }




    let notSubmergedArea = Math.min(Math.max(0, this.pos.y-CollisionMap.waterLevel(this.pos.x, this.world.time)), this.radius*2);
    this.vel.y -= 80*notSubmergedArea*dt;

    if(notSubmergedArea <= 0) this.vel = lerpDt(this.vel, targetVel, 0.96, 1, dt);
    this.pos = this.pos.add(this.vel.mul(dt));

    if(dp.length() < this.radius+playerTarget.radius){
        this.pos = playerTarget.pos.sub(dp.normalize().mul(this.radius+playerTarget.radius));
        if(this.swarm){
            playerTarget.vel = playerTarget.vel.add(dp.normalize().mul(playerTarget.spd*2));
            if(playerTarget == this.world.player){
                playerTarget.hp -= 1;
            }
        }
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