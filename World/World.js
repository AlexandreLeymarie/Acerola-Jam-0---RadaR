
function World(gl) {
    this.time = 0;
    
    this.submarine = new Submarine(vec(2, -6), this);

    this.player = new Player(vec(0, 0), this);
    this.cam = { pos: this.player.pos.copy(), zoom: 0.06 };


    
    this.lookingAtRadarEase = {
        active: false,
        camPosStart: null,
        camPosEnd: null,
        camZoomStart: null,
        camZoomEnd: null,
        time: 0,
        duration: 0.5
    }

    this.fishes = new Fishes(gl, this);

    this.initGl(gl);
}

World.prototype.initGl = function (gl) {
    this.program = createProgramFromShaderStrings(gl, basicVertexShaderString, worldFragmentShaderString);

    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    this.positions = [
        0, 0,
        0, gl.canvas.height,
        gl.canvas.width, 0,
        0, gl.canvas.height,
        gl.canvas.width, gl.canvas.height,
        gl.canvas.width, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

    this.initUniforms(gl);

    gl.useProgram(this.program);
    gl.uniform2f(this.resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
}

World.prototype.initUniforms = function (gl) {
    this.resolutionUniformLocation = gl.getUniformLocation(this.program, "u_resolution");
    this.timeUniformLocation = gl.getUniformLocation(this.program, "u_time");
    this.camPosUniformLocation = gl.getUniformLocation(this.program, "u_camPos");
    this.camZoomUniformLocation = gl.getUniformLocation(this.program, "u_camZoom");

    this.playerPosUniformLocation = gl.getUniformLocation(this.program, "u_playerPos");
    this.playerRadiusUniformLocation = gl.getUniformLocation(this.program, "u_playerRadius");
    this.playerVelUniformLocation = gl.getUniformLocation(this.program, "u_playerVel");
    this.playerHpUniformLocation = gl.getUniformLocation(this.program, "u_playerHp");

    this.submarinePosUniformLocation = gl.getUniformLocation(this.program, "u_submarinePos");
    this.submarineRadiusUniformLocation = gl.getUniformLocation(this.program, "u_submarineRadius");
    this.submarineVelUniformLocation = gl.getUniformLocation(this.program, "u_submarineVel");
    this.submarineLinkedUniformLocation = gl.getUniformLocation(this.program, "u_submarineLinked");

    this.diverPosUniformLocation = gl.getUniformLocation(this.program, "u_diverPos");
    this.diverRadiusUniformLocation = gl.getUniformLocation(this.program, "u_diverRadius");
    this.diverVelUniformLocation = gl.getUniformLocation(this.program, "u_diverVel");
    this.diverOxygenUniformLocation = gl.getUniformLocation(this.program, "u_diverOxygen");
}


World.prototype.update = function (dt) {


    this.lastLookAtRadar = this.player.lookingAtRadar;
    this.player.update(dt);
    this.submarine.update(dt);
    this.fishes.update(dt);
    this.manageLookingAtRadarEase(dt);


    this.time += dt;
}

World.prototype.manageLookingAtRadarEase = function(dt){
    if(this.player.lookingAtRadar != this.lastLookAtRadar){
        this.lookingAtRadarEase.active = true;
        this.lookingAtRadarEase.time = 0;
        if(this.player.lookingAtRadar){
            this.lookingAtRadarEase.camPosStart= this.cam.pos.copy();
            this.lookingAtRadarEase.camPosEnd= this.player.pos.add(vec(0.2, -0.1));
            this.lookingAtRadarEase.camZoomStart = this.cam.zoom;
            this.lookingAtRadarEase.camZoomEnd = 2;
        } else {
            this.lookingAtRadarEase.camPosStart= this.cam.pos.copy();
            this.lookingAtRadarEase.camPosEnd= this.player.pos.copy();
            this.lookingAtRadarEase.camZoomStart = this.cam.zoom;
            this.lookingAtRadarEase.camZoomEnd = 0.06;
        }
    }
    if(this.lookingAtRadarEase.active){
        this.lookingAtRadarEase.time += dt/this.lookingAtRadarEase.duration;
        if(this.lookingAtRadarEase.time >= 1){
            this.lookingAtRadarEase.time = 1;
            this.lookingAtRadarEase.active = false;
        }
        let st = smoothstep(0, 1, this.lookingAtRadarEase.time);
        this.cam.pos = this.lookingAtRadarEase.camPosStart.add(this.player.pos.add(vec(0.2, -0.1)).sub(this.lookingAtRadarEase.camPosStart).mul(st));
        this.cam.zoom = this.lookingAtRadarEase.camZoomStart+(this.lookingAtRadarEase.camZoomEnd-this.lookingAtRadarEase.camZoomStart)*st;
    } else {
        if(!this.player.lookingAtRadar){
            let playerPos = this.player.diver ? this.player.diver.pos : this.player.pos
            this.cam.pos = lerpDt(this.cam.pos, playerPos, 0.95, 1, dt);
            this.cam.zoom = 0.06;
        } else {
            this.cam.pos = this.player.pos.add(vec(0.2, -0.1));
            this.cam.zoom = 2;
        }
    }
}


World.prototype.draw = function (gl, ctx) {
    gl.useProgram(this.program);

    gl.uniform1f(this.timeUniformLocation, this.time);
    gl.uniform2f(this.camPosUniformLocation, this.cam.pos.x, this.cam.pos.y);
    gl.uniform1f(this.camZoomUniformLocation, this.cam.zoom);

    gl.uniform2f(this.playerPosUniformLocation, this.player.pos.x, this.player.pos.y);
    gl.uniform1f(this.playerRadiusUniformLocation, this.player.radius);
    gl.uniform2f(this.playerVelUniformLocation, this.player.vel.x, this.player.vel.y);
    gl.uniform1f(this.playerHpUniformLocation, this.player.hp);

    gl.uniform2f(this.submarinePosUniformLocation, this.submarine.pos.x, this.submarine.pos.y);
    gl.uniform1f(this.submarineRadiusUniformLocation, this.submarine.radius);
    gl.uniform2f(this.submarineVelUniformLocation, this.submarine.vel.x, this.submarine.vel.y);
    gl.uniform1i(this.submarineLinkedUniformLocation, this.submarine.linked);

    if(this.player.diver !== null){
        gl.uniform2f(this.diverPosUniformLocation, this.player.diver.pos.x, this.player.diver.pos.y);
        gl.uniform1f(this.diverRadiusUniformLocation, this.player.diver.radius);
        gl.uniform2f(this.diverVelUniformLocation, this.player.diver.vel.x, this.player.diver.vel.y);
        gl.uniform1f(this.diverOxygenUniformLocation, this.player.diver.oxygen);
    } else {
        gl.uniform2f(this.diverPosUniformLocation, 1000, 0);
        gl.uniform1f(this.diverRadiusUniformLocation, 0);
        gl.uniform2f(this.diverVelUniformLocation, 0, 0);
        gl.uniform1f(this.diverOxygenUniformLocation, -1);
    }


    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, this.positions.length / 2);

    this.fishes.draw(gl);

    if(this.player.diver){
        let ow = ctx.canvas.width*0.9*Math.pow(this.player.diver.oxygen/this.player.diver.maxOxygen, 2);
        ctx.fillStyle = "white";
        ctx.fillRect(ctx.canvas.width/2-ow/2, 10, ow, 2);
    }
}

