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


function Player(pos) {
    this.pos = pos;
    this.radius = 1;

    this.vel = vec(0);
    this.spd = 5;

    this.lookingAtRadar = false;
    this.radarKey = false;
    this.lastRadarKey = false;
}

Player.prototype.update = function (dt) {
    this.updateRadarOnKeyPress();
    this.movement(dt);
}

Player.prototype.updateRadarOnKeyPress = function(){
    this.radarKey = KEYLIST["KeyR"];
    if(this.radarKey && !this.lastRadarKey){
        this.lookingAtRadar = !this.lookingAtRadar;
    }
    this.lastRadarKey = this.radarKey;
}

Player.prototype.movement = function (dt) {
    this.lastPos = this.pos.copy();

    const keyDir = vec(
        (KEYLIST["ArrowRight"] ? 1 : 0) - (KEYLIST["ArrowLeft"] ? 1 : 0),
        (KEYLIST["ArrowUp"] ? 1 : 0) - (KEYLIST["ArrowDown"] ? 1 : 0)
    ).normalize();

    const targetVel = keyDir.mul(this.spd);


    let notSubmergedArea = Math.max(0, this.pos.y);
    this.vel.y -= 25*notSubmergedArea*this.radius*dt;

    if(notSubmergedArea <= 0) this.vel = lerpDt(this.vel, targetVel, 0.96, 1, dt);
    this.pos = this.pos.add(this.vel.mul(dt));

    let d;
    for(let i = 0; i < 10; i++){
        let normal = CollisionMap.gradient(this.pos);
        let surfaceTowardsSdf = this.pos.sub(normal.mul(this.radius));
        d = CollisionMap.sdf(surfaceTowardsSdf);
        if(d < 0){
            this.pos = this.pos.add(normal.mul(-d*.25));
        }
    }

    this.vel = this.pos.sub(this.lastPos).mul(1/dt);
}