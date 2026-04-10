import type { Direction } from "./input";

export type Cell = { x: number; z: number };

export type SnakePhase = "playing" | "gameover";

export type SnakeState = {
  phase: SnakePhase;
  snake: Cell[];
  direction: Direction;
  pendingDirection: Direction | null;
  food: Cell;
  score: number;
};

const opposite: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomFood(gridSize: number, avoid: Cell[]): Cell {
  for (let i = 0; i < 5000; i++) {
    const c = { x: randInt(gridSize), z: randInt(gridSize) };
    if (!avoid.some((s) => s.x === c.x && s.z === c.z)) return c;
  }
  return { x: 0, z: 0 };
}

export function createInitialState(gridSize: number): SnakeState {
  const mid = Math.floor(gridSize / 2);
  const snake: Cell[] = [
    { x: mid, z: mid },
    { x: mid - 1, z: mid },
    { x: mid - 2, z: mid },
  ];
  return {
    phase: "playing",
    snake,
    direction: "right",
    pendingDirection: null,
    food: randomFood(gridSize, snake),
    score: 0,
  };
}

export function queueDirection(
  state: SnakeState,
  next: Direction,
): SnakeState {
  if (state.phase !== "playing") return state;
  if (next === opposite[state.direction]) return state;
  return { ...state, pendingDirection: next };
}

export function stepSnake(gridSize: number, state: SnakeState): SnakeState {
  if (state.phase !== "playing") return state;

  const dir = state.pendingDirection ?? state.direction;
  const head = state.snake[0];
  if (!head) return state;

  const delta =
    dir === "up"
      ? { x: 0, z: -1 }
      : dir === "down"
        ? { x: 0, z: 1 }
        : dir === "left"
          ? { x: -1, z: 0 }
          : { x: 1, z: 0 };

  const newHead: Cell = { x: head.x + delta.x, z: head.z + delta.z };

  if (
    newHead.x < 0 ||
    newHead.z < 0 ||
    newHead.x >= gridSize ||
    newHead.z >= gridSize
  ) {
    return { ...state, phase: "gameover", pendingDirection: null };
  }

  if (
    state.snake.some((s) => s.x === newHead.x && s.z === newHead.z)
  ) {
    return { ...state, phase: "gameover", pendingDirection: null };
  }

  const ate =
    newHead.x === state.food.x && newHead.z === state.food.z;
  const newBody = ate
    ? [newHead, ...state.snake]
    : [newHead, ...state.snake.slice(0, -1)];

  const nextFood = ate
    ? randomFood(gridSize, newBody)
    : state.food;

  return {
    ...state,
    snake: newBody,
    direction: dir,
    pendingDirection: null,
    food: nextFood,
    score: ate ? state.score + 1 : state.score,
  };
}

export function restart(gridSize: number): SnakeState {
  return createInitialState(gridSize);
}
