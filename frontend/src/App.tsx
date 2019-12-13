import React, { useEffect, useState, useRef } from "react";
import { FunctionComponent } from "react";
import { Screen } from "./model/screen";
import { toggleFullScreen } from "./util/index";
import Gesture from "./model/Gesture";
import { screenSize } from "./model/socketIO";

const TouchContainer: FunctionComponent = props => {
  //   const { availWidth, availHeight } = window.screen;
  //   const screen = new Screen({ height: availHeight, width: availWidth });
  const [currentTouchEvent, setCurrentTouchEvent] = useState({} as TouchEvent);
  const [previousTouchEvent, setPreviousTouchEvent] = useState(
    {} as TouchEvent
  );
  const [touchBehavior, setTouchBehavior] = useState("Waiting");

  const [gesture, setGesture] = useState({} as Gesture);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    screenSize(
      new Screen({
        width: ref.current.clientWidth,
        height: ref.current.clientHeight
      })
    );
    window.addEventListener("resize", () => {
      screenSize(
        new Screen({
          width: ref.current.clientWidth,
          height: ref.current.clientHeight
        })
      );
    });
  }, []);

  const setTouchEvent = (event: TouchEvent) => {
    setPreviousTouchEvent(currentTouchEvent);
    setCurrentTouchEvent(event);
  };

  const handleTouchMove = (event: TouchEvent) => {
    setTouchEvent(event);
    setTouchBehavior("Moving");
    if (gesture.active) {
      gesture.update(event);
    }
  };
  const handleTouchEnd = (event: TouchEvent) => {
    setTouchEvent(event);
    setTouchBehavior("Waiting");
    if (gesture.active) {
      gesture.update(event);
      gesture.end(event);
      setGesture({} as Gesture);
    }
  };
  const handleTouchStart = (event: TouchEvent) => {
    setTouchEvent(event);
    if (!gesture.active) {
      console.clear();
      setGesture(new Gesture(event));
    } else {
      gesture.update(event);
    }
    setTouchBehavior("Starting");
  };

  return (
    <div
      ref={ref}
      className="full-screen"
      onContextMenu={event => event.preventDefault()}
      onTouchMove={() => handleTouchMove(event as TouchEvent)}
      onTouchEnd={() => handleTouchEnd(event as TouchEvent)}
      onTouchStart={() => handleTouchStart(event as TouchEvent)}
    >
      <button onClick={() => toggleFullScreen()}>FullScreen</button>
      <TouchEventLogger event={currentTouchEvent} />
      <p className="behavior">{touchBehavior}</p>
    </div>
  );
};

const TouchEventLogger: FunctionComponent<{ event: TouchEvent }> = props => {
  const touches = props.event?.changedTouches;
  return (
    <div>
      {touches &&
        Array.from(touches).map((touch, index) => (
          <p className="cor" key={index}>
            {`finger ${touch.identifier} : (${touch.clientX}, ${touch.clientY})`}
          </p>
        ))}
    </div>
  );
};

export const App: FunctionComponent = () => {
  return <TouchContainer />;
};
