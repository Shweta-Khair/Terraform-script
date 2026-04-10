import "./style.css";
import * as THREE from "three";

const GRID = 20;
const CELL = 0.45;
const TICK_MS = 140;
const BOARD_HALF = ((GRID - 1) * CELL) / 2;

type Vec2 = { x: number; z: number };

const OPPOSITE: Record<string, Vec2> = {
  "1,0": { x: -1, z: 0 },
  "-1,0": { x: 1, z: 0 },
  "0,1": { x: 0, z: -1 },
  "0,-1": { x: 0, z: 1 },
};

function keyDir(dx: number, dz: number): string {
  return `${dx},${dz}`;
}

function gridToWorld(p: Vec2): THREE.Vector3 {
  return new THREE.Vector3(p.x * CELL - BOARD_HALF, 0.25, p.z * CELL - BOARD_HALF);
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

class SnakeGame {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private snakeMeshes: THREE.Mesh[] = [];
  private foodMesh: THREE.Mesh;
  private snake: Vec2[] = [];
  private direction: Vec2 = { x: 1, z: 0 };
  private pendingDirection: Vec2 = { x: 1, z: 0 };
  private food: Vec2 = { x: 5, z: 5 };
  private score = 0;
  private alive = true;
  private lastTick = 0;
  private raf = 0;
  private readonly segmentGeom: THREE.BoxGeometry;
  private readonly segmentMat: THREE.MeshStandardMaterial;
  private readonly foodMat: THREE.MeshStandardMaterial;

  private scoreEl = document.getElementById("score")!;
  private statusEl = document.getElementById("status")!;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e14);

    const aspect = container.clientWidth / container.clientHeight || 1;
    const frustum = 6;
    this.camera = new THREE.OrthographicCamera(
      (-frustum * aspect) / 2,
      (frustum * aspect) / 2,
      frustum / 2,
      -frustum / 2,
      0.1,
      100
    );
    this.camera.position.set(0, 12, 0);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(4, 10, 6);
    this.scene.add(dir);

    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(GRID * CELL + 0.2, GRID * CELL + 0.2),
      new THREE.MeshStandardMaterial({ color: 0x152028, roughness: 0.9 })
    );
    board.rotation.x = -Math.PI / 2;
    board.position.y = 0;
    this.scene.add(board);

    this.segmentGeom = new THREE.BoxGeometry(CELL * 0.92, 0.45, CELL * 0.92);
    this.segmentMat = new THREE.MeshStandardMaterial({
      color: 0x3fb950,
      roughness: 0.45,
      metalness: 0.1,
    });
    this.foodMat = new THREE.MeshStandardMaterial({
      color: 0xf0883e,
      roughness: 0.35,
      emissive: 0x331100,
    });

    const foodGeom = new THREE.SphereGeometry(CELL * 0.38, 16, 12);
    this.foodMesh = new THREE.Mesh(foodGeom, this.foodMat);
    this.scene.add(this.foodMesh);

    window.addEventListener("resize", () => this.onResize(container));
    window.addEventListener("keydown", (e) => this.onKeyDown(e));

    this.reset();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  private onResize(container: HTMLElement): void {
    const w = container.clientWidth;
    const h = container.clientHeight;
    const aspect = w / h || 1;
    const frustum = 6;
    this.camera.left = (-frustum * aspect) / 2;
    this.camera.right = (frustum * aspect) / 2;
    this.camera.top = frustum / 2;
    this.camera.bottom = -frustum / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.code === "Space" || e.key === "r" || e.key === "R") {
      if (!this.alive) {
        e.preventDefault();
        this.reset();
      }
      return;
    }

    let next: Vec2 | null = null;
    if (e.code === "ArrowUp" || e.code === "KeyW") next = { x: 0, z: -1 };
    else if (e.code === "ArrowDown" || e.code === "KeyS") next = { x: 0, z: 1 };
    else if (e.code === "ArrowLeft" || e.code === "KeyA") next = { x: -1, z: 0 };
    else if (e.code === "ArrowRight" || e.code === "KeyD") next = { x: 1, z: 0 };

    if (!next) return;

    const curKey = keyDir(this.direction.x, this.direction.z);
    const opp = OPPOSITE[curKey];
    if (opp && next.x === opp.x && next.z === opp.z) return;

    this.pendingDirection = next;
    e.preventDefault();
  }

  private reset(): void {
    this.alive = true;
    this.score = 0;
    this.direction = { x: 1, z: 0 };
    this.pendingDirection = { x: 1, z: 0 };
    const mid = Math.floor(GRID / 2);
    this.snake = [
      { x: mid - 1, z: mid },
      { x: mid - 2, z: mid },
      { x: mid - 3, z: mid },
    ];
    this.clearSnakeMeshes();
    for (const _ of this.snake) {
      const m = new THREE.Mesh(this.segmentGeom, this.segmentMat);
      this.scene.add(m);
      this.snakeMeshes.push(m);
    }
    this.syncMeshes();
    this.placeFood();
    this.updateHud();
  }

  private clearSnakeMeshes(): void {
    for (const m of this.snakeMeshes) {
      this.scene.remove(m);
    }
    this.snakeMeshes = [];
  }

  private occupied(p: Vec2): boolean {
    return this.snake.some((s) => s.x === p.x && s.z === p.z);
  }

  private placeFood(): void {
    const empty: Vec2[] = [];
    for (let x = 0; x < GRID; x++) {
      for (let z = 0; z < GRID; z++) {
        const c = { x, z };
        if (!this.occupied(c)) empty.push(c);
      }
    }
    if (empty.length === 0) {
      this.food = { x: -1, z: -1 };
      this.foodMesh.visible = false;
      return;
    }
    const pick = empty[randomInt(empty.length)];
    this.food = pick;
    this.foodMesh.visible = true;
    const pos = gridToWorld(this.food);
    this.foodMesh.position.copy(pos);
    this.foodMesh.position.y = 0.28;
  }

  private syncMeshes(): void {
    for (let i = 0; i < this.snake.length; i++) {
      const m = this.snakeMeshes[i];
      const pos = gridToWorld(this.snake[i]);
      m.position.copy(pos);
    }
  }

  private step(): void {
    if (!this.alive) return;

    this.direction = this.pendingDirection;
    const head = this.snake[0];
    const next: Vec2 = {
      x: head.x + this.direction.x,
      z: head.z + this.direction.z,
    };

    if (next.x < 0 || next.x >= GRID || next.z < 0 || next.z >= GRID) {
      this.gameOver();
      return;
    }

    const hitSelf = this.snake.some((s) => s.x === next.x && s.z === next.z);
    if (hitSelf) {
      this.gameOver();
      return;
    }

    const ate = next.x === this.food.x && next.z === this.food.z;
    this.snake.unshift(next);

    if (ate) {
      this.score += 1;
      const newSeg = new THREE.Mesh(this.segmentGeom, this.segmentMat);
      this.scene.add(newSeg);
      this.snakeMeshes.unshift(newSeg);
      this.placeFood();
    } else {
      this.snake.pop();
    }

    for (let i = 0; i < this.snake.length; i++) {
      const pos = gridToWorld(this.snake[i]);
      this.snakeMeshes[i].position.copy(pos);
    }
    this.updateHud();
  }

  private gameOver(): void {
    this.alive = false;
    this.statusEl.textContent = `Game over — Score ${this.score}. Press Space or R to restart.`;
    this.statusEl.classList.remove("hidden");
  }

  private updateHud(): void {
    this.scoreEl.textContent = `Score: ${this.score}`;
    if (this.alive) {
      this.statusEl.classList.add("hidden");
    }
  }

  private loop(now: number): void {
    this.raf = requestAnimationFrame(this.loop);
    if (this.alive && now - this.lastTick >= TICK_MS) {
      this.lastTick = now;
      this.step();
    }
    this.renderer.render(this.scene, this.camera);
  }

}

const app = document.getElementById("app");
if (app) {
  new SnakeGame(app);
}
