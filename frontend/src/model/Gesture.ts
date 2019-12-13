import { swipe, touch, client } from "./socketIO";
import { ICoordinate, extractCoordinates, inside } from "./Coordinate";
import { avg } from "../util/index";

export const GestureType = {
  touch: "touch",
  swipe: "swipe",
  scrollVertical: "scrollVertical",
  tripleSwipe: "tripleSwipe",
  quadrupleSwipe: "quadrupleSwipe",
  zoomIn: "zoomIn",
  zoomOut: "zoomOut"
};

export default class Gesture {
  private _prevEvent: TouchEvent;
  private _curEvent: TouchEvent;
  private _endEvent: TouchEvent;

  private readonly _startTime: number;
  private _curTime: number;
  private _prevTime: number;
  private _endTime: number;
  private _active = true;
  get active() {
    return this._active;
  }
  get totalDuration() {
    return Date.now() - this._startTime;
  }
  get unitDuration() {
    return this._curTime - this._prevTime;
  }
  constructor(event: TouchEvent) {
    this._startTime = Date.now();
    this._prevEvent = event;
    this._curEvent = event;
    console.log("Gesture started!");
  }
  /**
   * @param ds distances (pixel)
   */
  boostFactor(...ds: number[]) {
    return ds.map(d => Math.exp(0.1 * Math.abs(d / this.unitDuration) - 0.1));
  }

  delta() {
    return [this._curEvent, this._prevEvent]
      .map(event =>
        Array.from(event.touches).map(touch => ({
          x: touch.clientX,
          y: touch.clientY
        }))
      )
      .reduce((cur, prev) =>
        cur.map((touch, index) => ({
          x: touch.x - prev[index].x,
          y: touch.y - prev[index].y
        }))
      );
  }

  static extractCoordinates(coordinates: ICoordinate[]) {
    let xArr = [] as number[];
    let yArr = [] as number[];
    coordinates.forEach(({ x, y }) => (xArr.push(x), yArr.push(y)));
    return [xArr, yArr];
  }

  update(event: TouchEvent) {
    if (!this.active) {
      return;
    }
    console.log(
      "Gesture processing with %d finger(s)",
      this._curEvent.touches.length
    );
    console.log(this.totalDuration);
    this._prevEvent = this._curEvent;
    this._curEvent = event;
    this._prevTime = this._curTime;
    this._curTime = Date.now();

    if (event.touches.length === 1) {
      const [{ x: dx, y: dy }] = this.delta();
      if (inside(100, dx, dy)) {
        client.emit(GestureType.swipe, dx, dy, ...this.boostFactor(dx, dy));
      }
    } else if (event.touches.length === 2) {
      const [dx, dy] = extractCoordinates(this.delta());

      const dyAvg = avg(...dy);
      const vyBoosted = this.boostFactor(dyAvg)[0] + 1;
      if (!inside(1, ...dy) && inside(4, ...dx) && dyAvg % 4 === 0) {
        client.emit(GestureType.scrollVertical, dyAvg, vyBoosted);
      }
    } else if (event.touches.length === 3) {
      const [dx, dy] = extractCoordinates(this.delta());
      const dxAvg = avg(...dx);
      const vxBoosted = this.boostFactor(dxAvg)[0] + 1;
      if (!inside(10, ...dx) && inside(4, ...dy)) {
        client.emit(GestureType.tripleSwipe, dxAvg, vxBoosted);
        this._active = false;
      }
    } else if (event.touches.length === 4) {
      const [dx, dy] = extractCoordinates(this.delta());
      const dxAvg = dx.reduce((cur, prev) => cur + prev) / dx.length;
      const vxBoosted = this.boostFactor(dxAvg)[0] + 1;
      if (!inside(10, ...dx) && inside(4, ...dy)) {
        console.log(dx);
        client.emit(GestureType.quadrupleSwipe, dxAvg, vxBoosted);
        this._active = false;
      }
    }
  }

  end(event: TouchEvent) {
    this._endEvent = event;
    this._endTime = Date.now();
    this._active = false;
    if (this.totalDuration <= 100) {
      touch(this._endEvent.touches.length);
    }
    console.log("Gesture ended!");
  }
}
