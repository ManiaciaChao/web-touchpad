import SocketIOClient from "socket.io-client";
import { GestureType } from "./Gesture";
import { Screen } from "./screen";

export const client = SocketIOClient("http://192.168.1.106:3000");

client.on("connect", function() {
  console.log("contected!");
});
client.on("event", function(data) {
  console.log(data);
});
client.send("Hi");

export const swipe = (dx, dy, ...args) =>
  client.emit(GestureType.swipe, dx, dy, ...args);

export const touch = fingersNum => client.emit(GestureType.touch, fingersNum);

export const screenSize = (screen: Screen) =>
  client.emit("screen", JSON.stringify(screen));
