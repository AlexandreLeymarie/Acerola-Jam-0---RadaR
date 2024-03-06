const worldFragmentShaderString = /*glsl*/ `
    precision mediump float;

    #define SKY 1.6*vec3(135,206,235)/255.
    #define WATER 0.5*vec3(57, 89, 204)/255.

    uniform vec2 u_resolution;

    uniform float u_time;
    uniform vec2 u_camPos;
    uniform float u_camZoom;

    uniform vec2 u_playerPos;
    uniform float u_playerRadius;

    vec2 coordToWorldPos(vec2 c){
        vec2 p = (c-.5*u_resolution.xy)/u_resolution.y;
        p /= u_camZoom;
        p += u_camPos;
        return p;
    }

    float waterLevel(float x){
        x *= 0.8;
        float y = sin(x*3.+u_time)*0.1+cos(x*2.-u_time)*0.15;
        return y*0.7;
    }

    void main(){
        vec2 p = coordToWorldPos(gl_FragCoord.xy);
        vec2 pUp = coordToWorldPos(gl_FragCoord.xy+vec2(0, 1));

        vec3 col = mix(SKY*0.7, SKY*1.1, clamp(p.y*0.15, 0., 1.));

        float waterLevelValue = waterLevel(p.x);
        vec3 waterCol;
        if(p.y <= waterLevelValue){
            col = WATER;
            if(pUp.y > waterLevelValue){
                col = mix(col, vec3(1.), 0.5);
            }
            float depth = waterLevelValue-p.y;
            col = mix(SKY, col, clamp(0.4+depth*0.05+waterLevel(p.x+sin(p.y*2.+u_time*2.)*0.1)*.1, 0., 1.2));
            waterCol = col;
        }

        if(length(p-u_playerPos) <= u_playerRadius){
            col = vec3(0.2, 0.3, 0.4);
            if(p.y <= waterLevelValue){
                col = mix(col, waterCol, 0.5);
            }
        }

        gl_FragColor = vec4(col, 1);
    }
`;







const debugWorldFragmentShaderString = /*glsl*/ `
    precision mediump float;

    uniform vec2 u_resolution;

    uniform float u_time;
    uniform vec2 u_camPos;
    uniform float u_camZoom;

    vec2 coordToWorldPos(vec2 c){
        vec2 p = (c-.5*u_resolution.xy)/u_resolution.y;
        p /= u_camZoom;
        p -= u_camPos;
        return p;
    }

    void main(){
        vec2 p = coordToWorldPos(gl_FragCoord.xy);

        vec3 col = vec3(p, 0);

        vec2 fp = fract(p);
        float th = 0.02;
        if(fp.x < th || fp.x > 1.-th || fp.y < th || fp.y > 1.-th) col = mix(col, 1.-col, .5);

        if(length(p) < .5){
            col = vec3(1);
        }

        gl_FragColor = vec4(col, 1);
    }
`;
