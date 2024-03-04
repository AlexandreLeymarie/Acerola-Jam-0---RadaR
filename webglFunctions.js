
function createShader(gl, type, source){
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success){
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader){
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success){
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function createProgramFromShaderStrings(gl, vertexShaderString, fragmentShaderString){
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderString);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderString);
    return createProgram(gl, vertexShader, fragmentShader);
}