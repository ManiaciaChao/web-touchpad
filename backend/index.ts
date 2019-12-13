import { createServer } from "http";
import SocketIO from "socket.io";
import XdoToolAsync, { XdoToolBindings } from "xdotool";
import { execSync } from "child_process";

export const GestureType = {
  touch: "touch",
  swipe: "swipe",
  scrollVertical: "scrollVertical",
  tripleSwipe: "tripleSwipe",
  quadrupleSwipe: "quadrupleSwipe",
  zoomIn: "zoomIn",
  zoomOut: "zoomOut"
};

const debugOn = true;

const xdotoolBindings = new XdoToolBindings();

const xdotool = new XdoToolAsync(xdotoolBindings);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const httpServer = createServer();
const io = SocketIO(httpServer);

io.on("connection", client => {
  const scaleFactor = { x: 1, y: 1 };
  const printDebugLog = (...args) => debugOn && console.log(client.id, ...args);

  console.log("client %s connected!", client.id);
  client.send("!");
  client.on("event", data => {});

  client.on("screen", async data => {
    const touchpad = JSON.parse(data);
    const viewport = await xdotool.getViewportDimensions(0);
    scaleFactor.x = viewport.width / touchpad.width;
    scaleFactor.y = viewport.height / touchpad.height;
    printDebugLog("scaleFactor", scaleFactor);
  });

  client.on(
    GestureType.swipe,
    async (dx: number, dy: number, vx: number, vy: number, ...args) => {
      printDebugLog([GestureType.swipe, dx, dy, vx, vy, ...args]);

      const { x, y } = await xdotool.getMouseLocation();
      await xdotool.moveMouse({
        x: Math.round(x + scaleFactor.x * dx * vx),
        y: Math.round(y + scaleFactor.y * dy * vy)
      });
    }
  );

  client.on(GestureType.touch, async fingersNum => {
    printDebugLog([GestureType.touch, fingersNum]);
    switch (fingersNum + 1) {
      case 1:
        execSync("xdotool click 1");
        break;
      case 2:
        execSync("xdotool click 3");
        break;
      default:
        break;
    }
  });

  client.on(GestureType.scrollVertical, async (dy, ...args) => {
    printDebugLog([GestureType.scrollVertical, dy, ...args]);
    if (dy > 0) {
      execSync("xdotool click 4");
    } else if (dy < 0) {
      execSync("xdotool click 5");
    }
  });

  client.on(GestureType.tripleSwipe, async (dx, ...args) => {
    printDebugLog([GestureType.tripleSwipe, dx, ...args]);
    if (dx > 0) {
      execSync(`xdotool keydown alt key Tab sleep 1 keyup alt`);
    } else if (dx < 0) {
      execSync(
        "xdotool keydown alt keydown shift key Tab keyup shift sleep 1 keyup alt"
      );
    }
  });

  client.on(GestureType.quadrupleSwipe, async (dx, ...args) => {
    printDebugLog([GestureType.quadrupleSwipe, dx, ...args]);
    if (dx > 0) {
      execSync(
        "xdotool keydown ctrl keydown super sleep 0.1 key 'Left' keyup ctrl keyup super"
      );
    } else if (dx < 0) {
      execSync(
        `xdotool keydown ctrl keydown super sleep 0.1 key 'Right' keyup ctrl keyup super`
      );
    }
  });

  client.on("message", data => {
    console.log(data);
  });

  client.on("disconnect", () => {});
});

io.listen(3000);
