

const CollisionMap = {
    sdf: function (p) {
        const rp = p.rotate(-0.4);
        return rp.y + 80. + noise(p.mul(0.5)) * 0.7 + noise(p.mul(1.5)) * 0.5;
    },
    gradient: function (p) {
        const h = vec(0.05, 0.);
        return (vec(this.sdf(p.add(h)) - this.sdf(p.sub(h)), this.sdf(p.add(h.yx())) - this.sdf(p.sub(h.yx())))).normalize();
    }
}

