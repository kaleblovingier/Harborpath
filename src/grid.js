// Uniform latitude/longitude grid, so a nearby search looks at a few cells
// instead of every point in the country.

export function createGrid(lats, lngs, cellDeg = 0.5) {
  const cell = (deg) => Math.floor(deg / cellDeg);
  // Rows and columns stay far below 1e6 for any cell size >= 0.001 degrees.
  const key = (row, col) => row * 1e6 + col;
  const cells = new Map();
  for (let i = 0; i < lats.length; i++) {
    const k = key(cell(lats[i]), cell(lngs[i]));
    const list = cells.get(k);
    if (list) list.push(i);
    else cells.set(k, [i]);
  }

  return {
    /**
     * Call fn(i) for every point in a cell that overlaps the box. One extra
     * ring of cells absorbs floating-point error at cell edges, so no point
     * inside the box is missed. Callers apply their own exact test.
     */
    forEachCandidate(minLat, maxLat, minLng, maxLng, fn) {
      const r1 = cell(maxLat) + 1;
      const c0 = cell(minLng) - 1;
      const c1 = cell(maxLng) + 1;
      for (let r = cell(minLat) - 1; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const list = cells.get(key(r, c));
          if (list) for (let j = 0; j < list.length; j++) fn(list[j]);
        }
      }
    },
  };
}
