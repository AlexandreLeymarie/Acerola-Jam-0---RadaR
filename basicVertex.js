const basicVertexShaderString = /*glsl*/ `
    precision mediump float;

    attribute vec2 a_position;
    uniform vec2 u_resolution;

    void main(){
        gl_Position = vec4((a_position/u_resolution)*2.-1., 0, 1);
    }
`;