import "./style.css";
import { Game } from "./game/Game";

const root = document.querySelector<HTMLElement>("#app");
if (!root) {
  throw new Error("Missing #app root element");
}

const game = new Game(root);
game.start();
