export interface ICoordinate {
  x: number;
  y: number;
}

export const extractCoordinates = (coordinates: ICoordinate[]) => {
  let xArr = [] as number[];
  let yArr = [] as number[];
  coordinates.forEach(({ x, y }) => (xArr.push(x), yArr.push(y)));
  return [xArr, yArr];
};

/**
 * @param r range (pixel)
 * @param ds distances (pixel)
 */
export const inside = (r, ...ds: number[]) =>
  ds.map(d => Math.abs(d) <= r).reduce((cur, next) => cur && next);
