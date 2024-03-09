const worldFragmentShaderString = /*glsl*/ `
    precision mediump float;

    #define PI 3.14159265358979

    #define SKY 1.6*vec3(135,206,235)/255.
    #define WATER 0.5*vec3(57, 89, 204)/255.
    #define PLAYER vec3(117, 85, 74)/255.
    #define PLAYER_LIGHT vec3(1, 1, 0.8)
    #define RADAR_GREEN  vec3(139,246,136)/255.
    #define GROUND 0.2*vec3(65, 71, 82)/255.

    uniform vec2 u_resolution;

    uniform float u_time;
    uniform vec2 u_camPos;
    uniform float u_camZoom;

    uniform vec2 u_playerPos;
    uniform float u_playerRadius;
    uniform vec2 u_playerVel;

    float rand(float n){return fract(sin(n*37.382) * 43.523);}

    /*float rand(vec2 p){
        return fract(19.326*sin(p.x*24.785+p.y*88.573));
    }*/

    // from https://www.shadertoy.com/view/4djSRW
    // Hash without Sine
    // MIT License...
    /* Copyright (c)2014 David Hoskins.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.*/
    float rand(vec2 p)
    {
        vec3 p3  = fract(vec3(p.xyx) * .1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
    }


    float noise(float p){
        float fl = floor(p);
        float fc = fract(p);
        return mix(rand(fl), rand(fl + 1.0), fc);
    }
    
    float noise(vec2 n) {
        const vec2 d = vec2(0.0, 1.0);
      vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
        return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
    }

    // from Inigo Quilez
    float sdBox( in vec2 p, in vec2 b )
    {
        vec2 d = abs(p)-b;
        return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
    }

    vec2 coordToWorldPos(vec2 c){
        vec2 p = (c-.5*u_resolution.xy)/u_resolution.y;
        p /= u_camZoom;
        p += u_camPos;
        return p;
    }

    mat2 rotate2d(float a){
        float c = cos(a), s = sin(a);
        return mat2(c, -s, s, c);
    }

    float waterLevel(float x){
        x *= 0.8;
        float y = sin(x*3.+u_time)*0.1+cos(x*2.-u_time)*0.15;
        return y*0.7;
    }

    float sdPlayer(vec2 p){
        return length(p-u_playerPos) - u_playerRadius;
    }

    float sdGround(vec2 p){
        return p.y+40.+noise(p*0.5)*0.7+noise(p*1.5)*0.5;
    }
    vec2 gradient(vec2 p){
        vec2 h = vec2(0.05, 0.);
        return normalize(vec2(sdGround(p+h.xy)-sdGround(p-h.xy), sdGround(p+h.yx)-sdGround(p-h.yx)));
    }
    

    void main(){
        vec2 p = coordToWorldPos(gl_FragCoord.xy);
        vec2 pUp = coordToWorldPos(gl_FragCoord.xy+vec2(0, 1));
        vec2 pDown = coordToWorldPos(gl_FragCoord.xy+vec2(0, -1));
        vec2 pRight = coordToWorldPos(gl_FragCoord.xy+vec2(1, 0));
        vec2 pLeft = coordToWorldPos(gl_FragCoord.xy+vec2(-1, 0));

        vec3 col = mix(SKY*0.7, SKY*1.1, smoothstep(0., 20., p.y));

        float waterLevelValue = waterLevel(p.x);
        vec3 waterCol = col;
        bool isInWater = p.y <= waterLevelValue;
        if(isInWater){
            col = WATER;
            if(pUp.y > waterLevelValue){
                col = mix(col, vec3(1.), 0.5);
            }
            float depth = waterLevelValue-p.y;
            //float playerShadow = 1.-smoothstep(-0.5, 0., abs(p.x-u_playerPos.x) - u_playerRadius)*(1.-step(u_playerPos.y, p.y));
            col = mix(SKY, col, clamp(0.4+depth*0.03+waterLevel(p.x+sin(p.y*2.+u_time*2.)*0.1)*.05, 0., 1.2));
            waterCol = col;

        }

        float sdPlayerValue = sdPlayer(p);
        if(sdPlayerValue <= 0.){
            col = PLAYER;//vec3(0.2, 0.3, 0.4);
            vec2 playerP = (p-u_playerPos)/u_playerRadius;


            float z = sqrt(1.-playerP.x*playerP.x-playerP.y*playerP.y);


            if(abs(playerP.y) < 0.35){// && length(playerP) < 0.9){// && abs(playerP.x) > 0.07){
                col = mix(PLAYER_LIGHT, waterCol, .2);

                /*if(length(playerP) < 0.1){
                    col = vec3(1);
                }*/
                float lp = length(playerP);
                col = mix(PLAYER_LIGHT, col, smoothstep(0.05, 0.2, lp));
                //col = mix(vec3(1, 1, 0.7), col, 1.-0.5*smoothstep(0.1, 1., length(playerP)));

                if(sdBox(playerP-vec2(0.2, -0.1), vec2(0.15)) < 0.){
                //if(length(playerP-vec2(0.2, -0.1)) < 0.15){
                    col = vec3(0.05);
                    vec2 radarP = (playerP-vec2(0.2, -0.1))*150.+u_playerPos;
                    vec2 fRadarP = fract(radarP*0.4);
                    if(fRadarP.x < 0.05 || fRadarP.y < 0.05 || fRadarP.x > 1.-0.05 || fRadarP.y > 1.-0.05){
                        col = mix(col, RADAR_GREEN, 0.5);
                    }
                    //if(floor(fRadarP))

                    float s = sin(radarP.x*2.)*0.5;
                    if(radarP.y < s && radarP.y+0.2 >= s){
                        col = RADAR_GREEN;
                    }
                    if(length(radarP-u_playerPos) <= u_playerRadius){
                        col = RADAR_GREEN;
                    }
                    if(sdGround(radarP) <= 0.){
                        col = RADAR_GREEN;
                    }
                    //float a = u_time;
                    //float a = atan(radarP.y, radarP.x);
                    //col = mix(col, vec3(0.05), smoothstep(mod(u_time, PI*2.)-PI, mod(u_time-1., PI*2.)-PI, a));
                }

                col = mix(col, vec3(0.9, 0.9, 1), 0.3);
            }


            col *= 0.6+z*0.4;

            /*if(sdPlayer(pLeft) > 0. || sdPlayer(pRight) > 0. || sdPlayer(pDown) > 0. || sdPlayer(pUp) > 0.){
                col *= 0.5;
            }*/


            if(p.y <= waterLevelValue){
                col = mix(col, waterCol, 0.5);
            }
            //if(isInWater) col += 5.*PLAYER_LIGHT*smoothstep(0., 8., length(p-u_playerPos)+(rand(p+mod(u_time*28.2823, 11.73)))*.2);

        } else {
            /*if(abs(p.y-u_playerPos.y) < abs(p.x-u_playerPos.x)*0.4){
                col = mix(PLAYER_LIGHT, col, 0.5+0.5*smoothstep(2., 4., length(p-u_playerPos)));
            }*/
            //if(isInWater) col = mix(PLAYER_LIGHT, col, 0.5+0.5*smoothstep(0., 8., length(p-u_playerPos)+(rand(p+mod(u_time*28.2823, 11.73)))*.5));
        }

        bool isInGround = sdGround(p) <= 0.;
        if(isInGround){
            col = GROUND*(1.+noise(p*5.)*0.5);
            if(sdGround(pLeft) > 0. || sdGround(pRight) > 0. || sdGround(pDown) > 0. || sdGround(pUp) > 0.){
                vec2 lightDir = normalize(p-u_playerPos);
                vec2 normal = gradient(p);
				float amountOfLight = clamp(dot(-lightDir, normal), -1., 1.);
				if(amountOfLight < 0.){
					col = mix(waterCol, col, amountOfLight+1.);
				} else {
                    float lightColValue = 1.-smoothstep(0., 12., length(p-u_playerPos)+(rand(p+mod(u_time*28.2823, 11.73)))*.5);
					col = mix(col, PLAYER_LIGHT, amountOfLight*lightColValue*0.6);
				}
                //col = vec3(1);
            }
        }
        

        if(isInWater){
            float la = smoothstep(0., 12., length(p-u_playerPos)+(rand(p+mod(u_time*28.2823, 11.73)))*.5);
            col = mix(PLAYER_LIGHT, col, 0.6+0.4*la);
            vec2 fp = fract(p*.5+vec2(noise(u_time*.3), noise(u_time*.3+174.)));
            vec2 flp = floor(p*.5);
            float offsetx = rand(flp);
            float offsety = fract(offsetx*82.011);
            vec2 offset = (vec2(offsetx, offsety)-.5)*.8;

            if(!isInGround) col = mix(col, vec3(1), smoothstep(-20., -30., p.y)*.2*(1.-la)*(1.-smoothstep(.01, .025,  length(fp-.5+offset))));
            //float lightAmount = 1.-smoothstep(0., 8., length(p-u_playerPos)+(rand(p+mod(u_time*28.2823, 11.73)))*.5);
            //col += 0.5*PLAYER_LIGHT*(1.-smoothstep(0., 8., length(p-u_playerPos)+(rand(p+mod(u_time*28.2823, 11.73)))*.5));
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
