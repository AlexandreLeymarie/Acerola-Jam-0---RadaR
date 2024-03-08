const max = Math.max;
const min = Math.min;
function fract(x){
    return x-Math.floor(x);
}
const sin = Math.sin;
const abs = Math.abs;
function mix(a, b, x){
    return a+(b-a)*x;
}
const floor = Math.floor;

function rand(p) {

    const p3 = vec(fract(p.x * .1031), fract(p.y * .1031));//fract(vec3(p.xyx) * .1031);
    const a = p3.x * (p3.y + 33.33) + p3.y * (p3.x + 33.33) + p3.x * (p3.x + 33.33); //p3 += dot(p3, p3.yzx + 33.33);
    p3.x += a;
    p3.y += a;
    return fract((p3.x + p3.y) * p3.x);
}


function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}

function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
}


function noise(n) {
    const d = vec(0.0, 1.0);
    const b = vec(floor(n.x), floor(n.y));
    const f = vec(smoothstep(0.0, 1.0, fract(n.x)), smoothstep(0.0, 1.0, fract(n.y)));
    return mix(
        mix(rand(b), rand(b.add(d.yx())), f.x),
        mix(rand(b.add(d)), rand(b.add(d.yy())), f.x),
        f.y);
}
