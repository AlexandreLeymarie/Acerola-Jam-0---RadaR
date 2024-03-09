const fishFragmentShaderString = /*glsl*/ `
    precision mediump float;

    uniform vec2 u_resolution;

    uniform float u_time;
    uniform vec2 u_camPos;
    uniform float u_camZoom;

    uniform vec2 u_position;

    vec2 coordToWorldPos(vec2 c){
        vec2 p = (c-.5*u_resolution.xy)/u_resolution.y;
        p /= u_camZoom;
        p += u_camPos;
        return p;
    }

    void main(){
        vec2 p = coordToWorldPos(gl_FragCoord.xy);
        vec2 pUp = coordToWorldPos(gl_FragCoord.xy+vec2(0, 1));
        vec2 pDown = coordToWorldPos(gl_FragCoord.xy+vec2(0, -1));
        vec2 pRight = coordToWorldPos(gl_FragCoord.xy+vec2(1, 0));
        vec2 pLeft = coordToWorldPos(gl_FragCoord.xy+vec2(-1, 0));

        vec3 col = vec3(0, 0, 0);
        float alpha = 0.;

        if(length(p-u_position) < 0.5){
            alpha = 1.;
            col = vec3(.1, .1, .3);
        }

        gl_FragColor = vec4(col, alpha);
    }
`;