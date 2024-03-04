
function World(gl) {
    this.cam = { pos: vec(0), zoom: 1 };
    this.time = 0;


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
}


World.prototype.update = function(dt){
    
    this.time += dt;
}



World.prototype.draw = function (gl) {
    gl.uniform1f(this.timeUniformLocation, this.time);



    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    gl.clearColor(0, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(this.program);
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, this.positions.length/2);
}

