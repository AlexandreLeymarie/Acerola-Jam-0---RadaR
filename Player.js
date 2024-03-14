const KEYLIST = [];
window.addEventListener('keydown', function (event) {
    KEYLIST[event.code] = true;
    if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault();
    }
});
window.addEventListener('keyup', function (event) {
    KEYLIST[event.code] = false;
});

function lerpDt(a, b, p, t, dt){
    if(a instanceof Vector){
        return a.add(b.sub(a).mul(1-Math.pow(1-p, dt/t)));
    }
    return a + (b - a) * (1-Math.pow(1-p, dt/t));
}


function Player(pos, world) {
    this.world = world;
    this.pos = pos;
    this.radius = 1;

    this.vel = vec(0);
    this.spd = 5;

    this.lookingAtRadar = false;
    this.radarKey = false;
    this.lastRadarKey = false;

    this.exitKey = false;
    this.lastExitKey = false;
    this.diver = null;
    this.hp = 5;
    this.linked = false;
    this.timeSinceWon = -1;
    this.won = false;
}

Player.prototype.update = function (dt) {
    this.updateRadarOnKeyPress();
    this.updateDiverOnKeyPress();
    this.movement(dt);
    if(this.diver !== null) this.diver.update(dt);
}

Player.prototype.updateRadarOnKeyPress = function(){
    this.radarKey = KEYLIST["KeyR"];
    if(this.radarKey && !this.lastRadarKey && !this.diver){
        this.lookingAtRadar = !this.lookingAtRadar;
    }
    this.lastRadarKey = this.radarKey;
}

Player.prototype.updateDiverOnKeyPress = function(){
    this.exitKey = KEYLIST["KeyE"];
    if(this.exitKey && !this.lastExitKey && this.diver === null && this.hp > 0){
        this.diver = new Diver(this.pos.add(vec(this.radius*1.02, 0)), this.world);
        this.diver.vel = vec(this.vel.x+2, 0);
    }
    this.lastExitKey = this.exitKey;
}

Player.prototype.movement = function (dt) {
    this.lastPos = this.pos.copy();

    const keyDir = vec(
        (KEYLIST["ArrowRight"] ? 1 : 0) - (KEYLIST["ArrowLeft"] ? 1 : 0),
        (KEYLIST["ArrowUp"] ? 1 : 0) - (KEYLIST["ArrowDown"] ? 1 : 0)
    ).normalize();

    let targetVel = ((this.diver === null && this.hp > 0) ? keyDir.mul(this.spd) : vec(0, 0));


    let notSubmergedArea = Math.min(Math.max(0, this.pos.y-CollisionMap.waterLevel(this.pos.x, this.world.time)), this.radius*2);
    if(notSubmergedArea > 0 && this.linked && !this.won && this.hp > 0){
        this.timeSinceWon = 0;
        this.won = true;
    }
    if(this.timeSinceWon > -0.5){
        this.timeSinceWon += dt;
    }
    if(this.won && this.timeSinceWon > 1){
        targetVel = vec(0, 5);
    } else {
        this.vel.y -= 25*notSubmergedArea*this.radius*dt;
    }

    if(notSubmergedArea <= 0 || this.won) this.vel = lerpDt(this.vel, targetVel, 0.96, 1, dt);
    this.pos = this.pos.add(this.vel.mul(dt));

    let d;
    for(let i = 0; i < 5; i++){
        let normal = CollisionMap.gradient(this.pos);
        let surfaceTowardsSdf = this.pos.sub(normal.mul(this.radius));
        d = CollisionMap.sdf(surfaceTowardsSdf);
        if(d < 0){
            this.pos = this.pos.add(normal.mul(-d*.5));
            for(let fish of this.world.fishes.fishes){
                if(fish.pos.sub(this.pos).length() < 16*this.radius){
                    fish.swarm = true;
                }
            }
        }
    }

    this.vel = this.pos.sub(this.lastPos).mul(1/dt);
}