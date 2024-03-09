const fishFragmentShaderString = /*glsl*/ `
    precision mediump float;

    uniform vec2 u_resolution;

    uniform float u_time;
    uniform vec2 u_camPos;
    uniform float u_camZoom;

    uniform vec2 u_position;
    uniform float u_fishRadius;
    uniform vec2 u_fishVel;

    vec2 coordToWorldPos(vec2 c){
        vec2 p = (c-.5*u_resolution.xy)/u_resolution.y;
        p /= u_camZoom;
        p += u_camPos;
        return p;
    }

    /*float waterLevel(float x){
        x *= 0.8;
        float y = sin(x*3.+u_time)*0.1+cos(x*2.-u_time)*0.15;
        return y*0.7;
    }*/

    void main(){
        vec2 p = coordToWorldPos(gl_FragCoord.xy);
        vec2 pUp = coordToWorldPos(gl_FragCoord.xy+vec2(0, 1));
        vec2 pDown = coordToWorldPos(gl_FragCoord.xy+vec2(0, -1));
        vec2 pRight = coordToWorldPos(gl_FragCoord.xy+vec2(1, 0));
        vec2 pLeft = coordToWorldPos(gl_FragCoord.xy+vec2(-1, 0));

        /*float waterLevelValue = waterLevel(p.x);
        vec3 waterCol = col;
        bool isInWater = p.y <= waterLevelValue;
        if(isInWater){
            waterCol = WATER;
            if(pUp.y > waterLevelValue){
                col = mix(col, vec3(1.), 0.5);
            }
            float depth = waterLevelValue-p.y;
            waterCol = mix(SKY, waterCol, clamp(0.4+depth*0.03+waterLevel(p.x+sin(p.y*2.+u_time*2.)*0.1)*.05, 0., 1.2));
        }*/


        vec3 col = vec3(0, 0, 0);
        float alpha = 0.;

        if(length(p-u_position) < u_fishRadius){
            alpha = .5;
            col = vec3(.1, .1, .3);
            if(length(p-u_position-normalize(u_fishVel)*u_fishRadius*.6) < u_fishRadius*.3){
                //col = vec3(.8, .8, 1)*.7;
                col *= 4.;
            }
        }

        if(length(p-u_position+normalize(u_fishVel)*u_fishRadius) < u_fishRadius*.7){
            alpha = .5;
            col = vec3(.1, .1, .3)*.5;
        }

        gl_FragColor = vec4(col, alpha);
    }
`;