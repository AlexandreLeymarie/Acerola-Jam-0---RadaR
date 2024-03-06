const glCv = document.getElementById("webglCanvas");
glCv.width = 384;
glCv.height = 216;

const cv2d = document.getElementById("canvas2d");
cv2d.width = 854*1.5;
cv2d.height = 480*1.5;

const ctx = cv2d.getContext("2d");
ctx.font = "20px Verdana";
ctx.fillText("test", 10, 20);
ctx.fillRect(10, cv2d.height-20, 10, 10);
ctx.fillRect(cv2d.width-20, cv2d.height-20, 10, 10);
ctx.fillRect(cv2d.width-20, 10, 10, 10);

function fitCanvasesToScreen(){
    console.log(window.innerWidth, window.innerHeight);
    glCv.style.width = window.innerWidth+"px";
    const styleHeight = (window.innerWidth*glCv.height/glCv.width);
    glCv.style.height = styleHeight+"px";

    if(window.innerHeight < styleHeight){
        glCv.style.height = window.innerHeight+"px";
        glCv.style.width = (window.innerHeight*glCv.width/glCv.height)+"px";
    }

    cv2d.style.width = glCv.style.width;
    cv2d.style.height = glCv.style.height;
}



window.addEventListener('resize', fitCanvasesToScreen);

fitCanvasesToScreen();

const gl = glCv.getContext("webgl", {antialias: false});

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);



const world = new World(gl);


let lastUpdateTime = null;

function loop(){
    const now = Date.now();
    const dtInMilliseconds = lastUpdateTime == null ? 1000/60 : now-lastUpdateTime;
    const dtInSeconds = dtInMilliseconds/1000;

    world.draw(gl);
    world.update(dtInSeconds);

    requestAnimationFrame(loop);
}

loop();