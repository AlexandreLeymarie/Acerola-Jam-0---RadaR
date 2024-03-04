const glCv = document.getElementById("webglCanvas");
glCv.width = 384;
glCv.height = 216;

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