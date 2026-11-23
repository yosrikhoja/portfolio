/**
 * Shape masks for the particle constellations.
 * Coordinates are normalised to roughly [-1, 1] on both axes.
 * Each function returns true when (x, y) lies inside the shape.
 */
const shapes = {
  shield(x, y) {
    if (y < -.92 || y > .94) return false;
    const progress = (y + .92) / 1.86;
    const halfWidth = progress < .12
      ? .68 + .08 * (progress / .12)
      : .76 * Math.pow((1 - progress) / .88, .8);
    return Math.abs(x) < halfWidth;
  },

  envelope(x, y) {
    return Math.abs(x) <= .88 && Math.abs(y) <= .58;
  },

  cloud(x, y) {
    const lobes = [
      [x + .42, y - .12, .40], [x, y + .02, .51], [x - .42, y - .12, .35],
      [x + .06, y - .34, .39]
    ];
    return lobes.some(([dx, dy, r]) => dx * dx + dy * dy < r * r);
  },

  globe(x, y) {
    return x * x + y * y < .78 * .78;
  },

  lock(x, y) {
    const inBody = Math.abs(x) < .57 && y > -.02 && y < .72;
    const r = Math.hypot(x, y - .02);
    const inShackle = y < .02 && r > .22 && r < .4;
    return inBody || inShackle;
  },

  browser(x, y) {
    return Math.abs(x) < .88 && Math.abs(y) < .62;
  }
};

export const insideShape = (shape, x, y) => (shapes[shape] ? shapes[shape](x, y) : false);
