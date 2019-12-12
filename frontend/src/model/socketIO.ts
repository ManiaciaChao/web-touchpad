import SocketIOClient from "socket.io-client";
import { GestureType } from "./gesture";
import { Screen } from "./screen";

export const client = SocketIOClient("http://192.168.1.106:3000");

client.on("connect", function() {
  console.log("contected!");
});
client.on("event", function(data) {
  console.log(data);
});
client.send("Hi");
// client.emit(GestureType.swipe, 1, 1);

export const swipe = (dx, dy, ...args) =>
  client.emit(GestureType.swipe, dx, dy, ...args);

export const touch = () => client.emit(GestureType.touch);

export const screenSize = (screen: Screen) =>
  client.emit("screen", JSON.stringify(screen));
