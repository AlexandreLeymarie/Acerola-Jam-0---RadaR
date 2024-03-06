
function World(gl) {
    this.cam = { pos: vec(0), zoom: 0.08 };
    this.time = 0;

    this.player = new Player(vec(0));


    this.initGl(gl);
}

World.prototype.initGl = function(gl) {
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

World.prototype.initUniforms = function(gl){
    this.resolutionUniformLocation = gl.getUniformLocation(this.program, "u_resolution");
    this.timeUniformLocation = gl.getUniformLocation(this.program, "u_time");
    this.camPosUniformLocation = gl.getUniformLocation(this.program, "u_camPos");
    this.camZoomUniformLocation = gl.getUniformLocation(this.program, "u_camZoom");

    this.playerPosUniformLocation = gl.getUniformLocation(this.program, "u_playerPos");
    this.playerRadiusUniformLocation = gl.getUniformLocation(this.program, "u_playerRadius");
    this.playerVelUniformLocation = gl.getUniformLocation(this.program, "u_playerVel");
}


World.prototype.update = function(dt){

    //this.cam.pos.x = Math.cos(this.time)*8;
    //this.cam.pos.y = Math.sin(this.time)*8;
    this.player.update(dt);
    this.cam.pos = lerpDt(this.cam.pos, this.player.pos, 0.95, 1, dt);
    
    this.time += dt;
}



World.prototype.draw = function (gl) {
    gl.uniform1f(this.timeUniformLocation, this.time);
    gl.uniform2f(this.camPosUniformLocation, this.cam.pos.x, this.cam.pos.y);
    gl.uniform1f(this.camZoomUniformLocation, this.cam.zoom);

    gl.uniform2f(this.playerPosUniformLocation, this.player.pos.x, this.player.pos.y);
    gl.uniform1f(this.playerRadiusUniformLocation, this.player.radius);
    gl.uniform2f(this.playerVelUniformLocation, this.player.vel.x, this.player.vel.y);


    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    gl.clearColor(0, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(this.program);
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, this.positions.length/2);
}

