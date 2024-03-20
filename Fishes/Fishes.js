


function Fishes(gl, world){
    this.world = world;

    this.fishes = [];
    for(let i = 0; i < 1000; i++){
        //this.fishes.push(new Fish(vec((i%20), -Math.floor(i/20)), this.world));
        let pos;
        do{
            pos = vec(Math.random()*100-30, -30-Math.random()*200);
        }while(CollisionMap.sdf(pos) < 0);
        this.fishes.push(new Fish(pos, this.world));
    }

    this.initGl(gl);
}

Fishes.prototype.initGl = function (gl) {
    this.program = createProgramFromShaderStrings(gl, fishVertexShaderString, fishFragmentShaderString);

    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    this.positions = [
        -.5, -.5,
        -.5, .5,
        .5, -.5,
        -.5, .5,
        .5, .5,
        .5, -.5
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

    this.initUniforms(gl);

    gl.useProgram(this.program);
    gl.uniform2f(this.resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
}

Fishes.prototype.initUniforms = function (gl) {
    this.resolutionUniformLocation = gl.getUniformLocation(this.program, "u_resolution");
    this.timeUniformLocation = gl.getUniformLocation(this.program, "u_time");
    this.camPosUniformLocation = gl.getUniformLocation(this.program, "u_camPos");
    this.camZoomUniformLocation = gl.getUniformLocation(this.program, "u_camZoom");
    this.positionUniformLocation = gl.getUniformLocation(this.program, "u_position");
    this.scaleUniformLocation = gl.getUniformLocation(this.program, "u_scale");
    this.fishRadiusUniformLocation = gl.getUniformLocation(this.program, "u_fishRadius");
    this.fishVelUniformLocation = gl.getUniformLocation(this.program, "u_fishVel");
    this.fishIsAngryUniformLocation = gl.getUniformLocation(this.program, "u_isAngry");
}

Fishes.prototype.update = function(dt){
    for(let fish of this.fishes){
        fish.update(dt, this.fishes);
    }
}

Fishes.prototype.draw = function (gl) {
    gl.useProgram(this.program);
    
    gl.uniform1f(this.timeUniformLocation, this.world.time);
    gl.uniform2f(this.camPosUniformLocation, this.world.cam.pos.x, this.world.cam.pos.y);
    gl.uniform1f(this.camZoomUniformLocation, this.world.cam.zoom);

    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const half_resolution = vec(cv2d.width, cv2d.height).mul(.5);
    let n = 0;
    for(let fish of this.fishes){
        gl.uniform2f(this.positionUniformLocation, fish.pos.x, fish.pos.y);
        gl.uniform2f(this.scaleUniformLocation, fish.scale.x, fish.scale.y);
        gl.uniform1f(this.fishRadiusUniformLocation, fish.radius);
        gl.uniform2f(this.fishVelUniformLocation, fish.vel.x, fish.vel.y);
        gl.uniform1i(this.fishIsAngryUniformLocation, fish.swarm);

        const pos = half_resolution.add((fish.pos.sub(this.world.cam.pos)).mul(this.world.cam.zoom*cv2d.height));
        const scale = fish.scale.mul(this.world.cam.zoom*cv2d.height);
        ctx.fillStyle = "rgba(255, 255, 255, .5)";
        if(!(pos.x-scale.x/2 > cv2d.width || pos.x+scale.x/2 < 0 || pos.y-scale.y/2 > cv2d.height || pos.y+scale.y/2 < 0)){
            //ctx.fillRect(pos.x-scale.x/2, cv2d.height-pos.y-scale.y/2, scale.x, scale.y);
            gl.drawArrays(gl.TRIANGLES, 0, this.positions.length / 2);
            n++;
        }
    }
    //console.log(n);
}