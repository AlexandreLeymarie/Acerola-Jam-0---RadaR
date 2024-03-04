const glCv = document.getElementById("webglCanvas");
glCv.width = 800;
glCv.height = 500;

const gl = glCv.getContext("webgl", {antialias: false});

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);



const world = new World(gl);

world.draw(gl);
