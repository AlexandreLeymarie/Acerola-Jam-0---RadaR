const fishVertexShaderString = /*glsl*/ `
    precision mediump float;

    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_position;
    uniform vec2 u_scale;
    uniform vec2 u_camPos;
    uniform float u_camZoom;

    void main(){
        gl_Position = vec4(((0.5*u_resolution+(u_position-u_camPos+a_position*u_scale)*u_camZoom*u_resolution.y)/u_resolution)*2.-1., 0, 1);
    }
`;