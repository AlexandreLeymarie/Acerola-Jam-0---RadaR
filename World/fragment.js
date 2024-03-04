const worldFragmentShaderString = /*glsl*/ `
    precision mediump float;

    uniform vec2 u_resolution;
    uniform float u_time;

    vec2 coordToWorldPos(vec2 c){
        vec2 p = (c-.5*u_resolution.xy)/u_resolution.y;
        /*p /= u_camZoom;
        p += u_camPos;*/
        return p;
    }

    void main(){
        vec2 p = coordToWorldPos(gl_FragCoord.xy);
        p *= 4.;

        vec3 col = vec3(p, 0);

        vec2 fp = fract(p);
        float th = 0.02;
        if(fp.x < th || fp.x > 1.-th || fp.y < th || fp.y > 1.-th) col = mix(col, 1.-col, .5);

        gl_FragColor = vec4(col, 1);
    }
`;
