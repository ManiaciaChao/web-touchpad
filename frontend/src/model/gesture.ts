import { swipe, touch } from "./socketIO";

export const GestureType = {
  touch: "touch",
  swipe: "swipe",
  scroll: "scrool",
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
  get duration() {
    return Date.now() - this._startTime;
  }
  constructor(event: TouchEvent) {
    this._startTime = Date.now();
    this._prevEvent = event;
    this._curEvent = event;
    console.log("Gesture started!");
  }
  update(event: TouchEvent) {
    console.log(
      "Gesture processing with %d finger(s)",
      this._curEvent.touches.length
    );
    console.log(this.duration);
    this._prevEvent = this._curEvent;
    this._curEvent = event;
    this._prevTime = this._curTime;
    this._curTime = Date.now();

    if (event.touches.length == 1) {
      const { x: dx, y: dy } = [event, this._prevEvent]
        .map(event => ({
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        }))
        .reduce((cur, prev) => ({ x: cur.x - prev.x, y: cur.y - prev.y }));
      // if (dx ** 2 + dy ** 2 <= 1) {
      //   return;
      // }
      swipe(dx, dy, this._curTime - this._prevTime);
    }
    if (event.touches.length == 2) {
      const { x: dx, y: dy } = [event, this._prevEvent]
        .map(event => ({
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        }))
        .reduce((cur, prev) => ({ x: cur.x - prev.x, y: cur.y - prev.y }));
      // if (dx ** 2 + dy ** 2 <= 1) {
      //   return;
      // }
      swipe(dx, dy, this._curTime - this._prevTime);
    }
  }
  end(event: TouchEvent) {
    this._endEvent = event;
    this._endTime = Date.now();
    this._active = false;
    if (this.duration <= 100) {
      touch();
    }
    console.log("Gesture ended!");
  }
}
