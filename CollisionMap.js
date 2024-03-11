

const CollisionMap = {
    sdf: function (p) {
        /*const rp = p.rotate(-0.4);
        return rp.y + 80. + noise(p.mul(0.5)) * 0.7 + noise(p.mul(1.5)) * 0.5;*/
        const rp = p.rotate(-.4);
        const rp2 = p.rotate(.4);
        const leftSlope = rp.y+80.;
        const rightSlope = rp2.y+80.;
        const slopes = smoothMin(leftSlope, rightSlope, 2.);
        const hole = (p.sub(vec(0., -90.))).length()-30.;
        return (smoothMax(slopes, -hole, 6.)+noise(p.mul(0.5))*0.7+noise(p.mul(1.5))*0.5);
    },
    gradient: function (p) {
        const h = vec(0.05, 0.);
        return (vec(this.sdf(p.add(h)) - this.sdf(p.sub(h)), this.sdf(p.add(h.yx())) - this.sdf(p.sub(h.yx())))).normalize();
    }
}

