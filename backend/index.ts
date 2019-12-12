import { createServer } from "http";
import SocketIO from "socket.io";
import XdoToolAsync, { KeyboardAsync, XdoToolBindings } from "xdotool";
import { execSync } from "child_process";

export const GestureType = {
  touch: "touch",
  swipe: "swipe",
  zoomIn: "zoomIn",
  zoomOut: "zoomOut"
};

const xdotoolBindings = new XdoToolBindings();

const xdotool = new XdoToolAsync(xdotoolBindings);
const keyboard = new KeyboardAsync(xdotoolBindings);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// (async () => {
//   while (true) {
//     console.log(await xdotool.getMouseLocation());
//     await sleep(50);
//   }
// })();

const httpServer = createServer();
const io = SocketIO(httpServer);
io.on("connection", client => {
  const scaleFactor = { x: 1, y: 1 };
  console.log("client %s connected!", client.id);
  client.send("!");
  client.on("event", data => {});

  client.on("screen", async data => {
    const touchpad = JSON.parse(data);
    console.log(touchpad);
    const viewport = await xdotool.getViewportDimensions(touchpad.id as number);
    console.log(viewport);
    scaleFactor.x = viewport.width / touchpad.width;
    scaleFactor.y = viewport.height / touchpad.height;
    console.log("scaleFactor", scaleFactor);
  });

  client.on(GestureType.swipe, async (dx, dy, ...args) => {
    console.log(GestureType.swipe, dx, dy, ...args);
    const { x, y } = await xdotool.getMouseLocation();
    await xdotool.moveMouse({
      x: Math.round(x + scaleFactor.x * dx),
      y: Math.round(y + scaleFactor.y * dy)
    });
  });

  client.on(GestureType.touch, async () => {
    console.log(GestureType.touch);
    execSync("xdotool click 1");
  });

  client.on("message", data => {
    console.log(data);
  });
  client.on("disconnect", () => {});
});
// io.on("message", data => {
//   console.log(data);
// });
io.listen(3000);
