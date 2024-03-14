
function World(gl) {
    this.time = 0;
    
    this.submarine = new Submarine(vec(80, -239), this);

    this.player = new Player(vec(40, 0), this);
    this.cam = { pos: this.player.pos.copy(), zoom: 0.06 };


    this.state = 0;
    this.textState = 0;
    
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

    this.lastSkipKey = false;
    this.skipKey = false;
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
    this.playerTimeSinceWonUniformLocation = gl.getUniformLocation(this.program, "u_playerTimeSinceWon");
    this.playerTimeSinceHurtUniformLocation = gl.getUniformLocation(this.program, "u_playerTimeSinceHurt");

    this.submarinePosUniformLocation = gl.getUniformLocation(this.program, "u_submarinePos");
    this.submarineRadiusUniformLocation = gl.getUniformLocation(this.program, "u_submarineRadius");
    this.submarineVelUniformLocation = gl.getUniformLocation(this.program, "u_submarineVel");
    this.submarineLinkedUniformLocation = gl.getUniformLocation(this.program, "u_submarineLinked");

    this.diverPosUniformLocation = gl.getUniformLocation(this.program, "u_diverPos");
    this.diverRadiusUniformLocation = gl.getUniformLocation(this.program, "u_diverRadius");
    this.diverVelUniformLocation = gl.getUniformLocation(this.program, "u_diverVel");
    this.diverOxygenUniformLocation = gl.getUniformLocation(this.program, "u_diverOxygen");

    this.massPosUniformLocation = gl.getUniformLocation(this.program, "u_massPos");
    this.massRadiusUniformLocation = gl.getUniformLocation(this.program, "u_massRadius");

    this.gameStateUniformLocation = gl.getUniformLocation(this.program, "u_gameState");
}


World.prototype.update = function (dt) {


    if(this.state > 0){
        this.lastLookAtRadar = this.player.lookingAtRadar;
        this.player.update(dt);
        this.submarine.update(dt);
        this.fishes.update(dt);
        this.manageLookingAtRadarEase(dt);
    }

    if(this.state == 0){
        this.lastSkipKey = this.skipKey;
        this.skipKey = KEYLIST["KeyR"];
        if(this.skipKey && !this.lastSkipKey){
            if(this.textState < 5){
                this.textState++;
            } else {
                this.state++;
            }
        }
    }
    if(this.state == 1){
        this.lastSkipKey = this.skipKey;
        this.skipKey = KEYLIST["KeyR"];
        if(this.skipKey && !this.lastSkipKey){
            this.state++;
        }
    }
    if(this.state == 2){
        this.lastSkipKey = this.skipKey;
        this.skipKey = KEYLIST["ArrowDown"] || KEYLIST["ArrowUp"] || KEYLIST["ArrowLeft"] || KEYLIST["ArrowRight"];
        if(this.skipKey && !this.lastSkipKey){
            this.state++;
            window.setTimeout(() => {
                this.state++;
            }, 2000);
        }
    }
    if(this.state == 4){
        this.lastSkipKey = this.skipKey;
        this.skipKey = KEYLIST["KeyE"];
        if(this.skipKey && !this.lastSkipKey){
            this.state++;
        }
    }
    /*if(this.state == 6 && this.player.pos.y < -20){
        this.state++;
    }*/


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
            if(!this.player.won){
                let playerPos = this.player.diver ? this.player.diver.pos : this.player.pos
                this.cam.pos = lerpDt(this.cam.pos, playerPos, 0.95, 1, dt);
            }
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
    gl.uniform1f(this.playerTimeSinceWonUniformLocation, this.player.timeSinceWon);
    gl.uniform1f(this.playerTimeSinceHurtUniformLocation, this.player.timeSinceHurt);

    gl.uniform2f(this.submarinePosUniformLocation, this.submarine.pos.x, this.submarine.pos.y);
    gl.uniform1f(this.submarineRadiusUniformLocation, this.submarine.radius);
    gl.uniform2f(this.submarineVelUniformLocation, this.submarine.vel.x, this.submarine.vel.y);
    gl.uniform1i(this.submarineLinkedUniformLocation, this.submarine.linked);

    gl.uniform1f(this.gameStateUniformLocation, this.state);

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

    let n = 0;
    let massPos = vec(0);
    let massRadius = 0;
    for(let fish of this.fishes.fishes){
        if(fish.swarm && fish.pos.sub(this.player.pos).length() < 20){
            n++;
            massPos.x += fish.pos.x;
            massPos.y += fish.pos.y;
        }
    }
    massPos = massPos.mul(1/n);
    if(n > 10){
        massRadius = n*.2;
    }
    gl.uniform2f(this.massPosUniformLocation, massPos.x, massPos.y);
    gl.uniform1f(this.massRadiusUniformLocation, massRadius);


    if(this.state == 0){
        gl.uniform2f(this.playerPosUniformLocation, this.submarine.pos.x, this.submarine.pos.y);
        gl.uniform2f(this.massPosUniformLocation, this.submarine.pos.x, this.submarine.pos.y);
        gl.uniform1f(this.massRadiusUniformLocation, 200);
        gl.uniform2f(this.submarinePosUniformLocation, this.player.pos.x, this.player.pos.y);
        this.cam.pos = this.submarine.pos.add(vec(0.2, -0.1));
        this.cam.zoom = 2;
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
        ctx.fillRect(ctx.canvas.width/2-ow/2, ctx.canvas.height-18, ow, 8);
    }

    const cv = ctx.canvas;
    if(this.state == 0){
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.textBaseline = "middle";
        if(this.textState >= 0) drawText("There was an *aberration* in the radar detections…", cv.width/2, cv.height/7, ctx);
        if(this.textState >= 1) drawText("A moving mass, abnormally big, deep in the sea…", cv.width/2, 2*cv.height/7, ctx);
        if(this.textState >= 2) drawText("We sent a submersible to investigate…", cv.width/2, 3*cv.height/7, ctx);
        if(this.textState >= 3) drawText("The submersible did not come back.", cv.width/2, 4*cv.height/7, ctx);
        if(this.textState >= 4) drawText("And the mass just.. vanished ?!", cv.width/2, 5*cv.height/7, ctx);
        if(this.textState >= 5) drawText("This is the mission to rescue the submersible and unveil the mystery.", cv.width/2, 6*cv.height/7, ctx);
        drawText("press R to continue", cv.width-300, cv.height-80, ctx);
    }
    if(this.state == 1){
        drawText("press R to toggle the Radar view", cv.width/2, cv.height/4, ctx);
    }
    if(this.state == 2){
        drawText("Use the Arrow keys to move", cv.width/2, cv.height/4, ctx);
    }
    if(this.state == 4){
        drawText("Press E to Exit the submersible and dive with a limited supply of oxygen", cv.width/2, cv.height/4, ctx);
    }
    if(this.state == 6){
        drawText("Now find the lost submersible and bring it back to the surface", cv.width/2, cv.height/4, ctx);
    }
    if(this.player.hp <= 0){
        drawText("Game Over (reload the page to retry)", cv.width/2, cv.height/2-100, ctx);
        drawText("Tip : exit the submersible to attract the fishes away from it", cv.width/2, cv.height/2+100, ctx);
        drawText("then come back once the path is cleared", cv.width/2, cv.height/2+200, ctx);
    }
    if(this.player.won){
        drawText("Congratulations! You successfully saved the submersible!", cv.width/2, cv.height/2-300, ctx);
    }
    /*if(this.state == 8){
        drawText("You are now connected to the submersible", cv.width/2, cv.height/4, ctx);
    }*/
}

function drawText(text, x, y, ctx){
    ctx.fillStyle = "black";
    let m = ctx.measureText(text);
    const h = 100;
    ctx.beginPath();
    ctx.roundRect(x-1.1*m.width/2, y-h/2, 1.1*m.width, h, [20]);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillText(text, x, y);
}