import * as THREE from "three";
import { CELL_SIZE, GRID_SIZE, TICK_SECONDS } from "./constants";
import { attachInput, type Direction } from "./input";
import {
  createInitialState,
  queueDirection,
  restart,
  stepSnake,
  type SnakeState,
} from "./snakeState";

const BOARD_WORLD = GRID_SIZE * CELL_SIZE;

export class Game {
  private readonly root: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.OrthographicCamera;
  private readonly boardGroup = new THREE.Group();
  private readonly snakeMeshes: THREE.Mesh[] = [];
  private foodMesh: THREE.Mesh;
  private hudEl: HTMLElement;
  private accum = 0;
  private state: SnakeState;
  private raf = 0;
  private detachInput?: () => void;
  private lastTime = performance.now();

  constructor(root: HTMLElement) {
    this.root = root;
    this.state = createInitialState(GRID_SIZE);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d1117);

    const half = BOARD_WORLD / 2;
    this.camera = new THREE.OrthographicCamera(
      -half,
      half,
      half,
      -half,
      0.1,
      100,
    );
    this.camera.position.set(0, 40, 0);
    this.camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.35);
    dir.position.set(4, 10, 6);
    this.scene.add(dir);

    this.buildBoard();
    this.scene.add(this.boardGroup);

    const foodGeom = new THREE.BoxGeometry(
      CELL_SIZE * 0.85,
      CELL_SIZE * 0.5,
      CELL_SIZE * 0.85,
    );
    const foodMat = new THREE.MeshStandardMaterial({ color: 0xf85149 });
    this.foodMesh = new THREE.Mesh(foodGeom, foodMat);
    this.foodMesh.castShadow = false;
    this.scene.add(this.foodMesh);

    const segGeom = new THREE.BoxGeometry(
      CELL_SIZE * 0.92,
      CELL_SIZE * 0.55,
      CELL_SIZE * 0.92,
    );
    const headMat = new THREE.MeshStandardMaterial({ color: 0x58a6ff });
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3fb950 });
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(segGeom, i === 0 ? headMat : bodyMat);
      m.castShadow = false;
      this.snakeMeshes.push(m);
      this.scene.add(m);
    }

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.root.appendChild(this.renderer.domElement);

    this.hudEl = document.createElement("div");
    this.hudEl.className = "hud";
    this.root.appendChild(this.hudEl);

    this.syncMeshesFromState();
    this.updateHud();

    window.addEventListener("resize", this.onResize);
    this.onResize();

    this.detachInput = attachInput(this.renderer.domElement, {
      onDirection: (d: Direction) => this.onDirection(d),
      onTap: () => {
        if (this.state.phase === "gameover") {
          this.state = restart(GRID_SIZE);
          this.syncMeshesFromState();
          this.updateHud();
        }
      },
    });

    window.addEventListener("keydown", this.onKeyRestart);
  }

  private buildBoard(): void {
    const planeGeom = new THREE.PlaneGeometry(BOARD_WORLD, BOARD_WORLD);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x161b22,
      roughness: 0.9,
      metalness: 0,
    });
    const plane = new THREE.Mesh(planeGeom, planeMat);
    plane.rotation.x = -Math.PI / 2;
    this.boardGroup.add(plane);

    const gridMat = new THREE.LineBasicMaterial({
      color: 0x30363d,
      transparent: true,
      opacity: 0.65,
    });
    const half = BOARD_WORLD / 2;
    for (let i = 0; i <= GRID_SIZE; i++) {
      const o = -half + i * CELL_SIZE;
      const g1 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(o, 0.02, -half),
        new THREE.Vector3(o, 0.02, half),
      ]);
      const g2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-half, 0.02, o),
        new THREE.Vector3(half, 0.02, o),
      ]);
      this.boardGroup.add(new THREE.Line(g1, gridMat));
      this.boardGroup.add(new THREE.Line(g2, gridMat));
    }
  }

  private gridToWorld(c: { x: number; z: number }): THREE.Vector3 {
    const half = BOARD_WORLD / 2;
    const cx = -half + c.x * CELL_SIZE + CELL_SIZE / 2;
    const cz = -half + c.z * CELL_SIZE + CELL_SIZE / 2;
    return new THREE.Vector3(cx, CELL_SIZE * 0.3, cz);
  }

  private syncMeshesFromState(): void {
    const { snake, food } = this.state;
    while (this.snakeMeshes.length < snake.length) {
      const segGeom = new THREE.BoxGeometry(
        CELL_SIZE * 0.92,
        CELL_SIZE * 0.55,
        CELL_SIZE * 0.92,
      );
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3fb950 });
      const m = new THREE.Mesh(segGeom, bodyMat);
      m.castShadow = false;
      this.snakeMeshes.push(m);
      this.scene.add(m);
    }
    for (let i = 0; i < this.snakeMeshes.length; i++) {
      const m = this.snakeMeshes[i];
      if (!m) continue;
      const cell = snake[i];
      if (cell) {
        m.visible = true;
        const p = this.gridToWorld(cell);
        m.position.copy(p);
        const headMat = m.material as THREE.MeshStandardMaterial;
        headMat.color.setHex(i === 0 ? 0x58a6ff : 0x3fb950);
      } else {
        m.visible = false;
      }
    }
    this.foodMesh.position.copy(this.gridToWorld(food));
  }

  private updateHud(): void {
    const s = this.state;
    const hint =
      s.phase === "gameover"
        ? " — press R or tap to restart"
        : " — arrows / WASD; swipe on touch";
    this.hudEl.innerHTML = `Snakey · score <strong>${s.score}</strong>${hint}`;
  }

  private onDirection(dir: Direction): void {
    if (this.state.phase === "gameover") {
      this.state = restart(GRID_SIZE);
      this.syncMeshesFromState();
      this.updateHud();
      return;
    }
    this.state = queueDirection(this.state, dir);
  }

  private onKeyRestart = (e: KeyboardEvent): void => {
    if (e.key === "r" || e.key === "R") {
      this.state = restart(GRID_SIZE);
      this.syncMeshesFromState();
      this.updateHud();
    }
  };

  private onResize = (): void => {
    const w = this.root.clientWidth || window.innerWidth;
    const h = this.root.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    const half = BOARD_WORLD / 2;
    if (aspect >= 1) {
      this.camera.left = -half * aspect;
      this.camera.right = half * aspect;
      this.camera.top = half;
      this.camera.bottom = -half;
    } else {
      this.camera.left = -half;
      this.camera.right = half;
      this.camera.top = half / aspect;
      this.camera.bottom = -half / aspect;
    }
    this.camera.updateProjectionMatrix();
  };

  private tick = (now: number): void => {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.accum += dt;
    while (this.accum >= TICK_SECONDS && this.state.phase === "playing") {
      this.accum -= TICK_SECONDS;
      this.state = stepSnake(GRID_SIZE, this.state);
      this.syncMeshesFromState();
      this.updateHud();
    }
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  };

  start(): void {
    this.lastTime = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("keydown", this.onKeyRestart);
    this.detachInput?.();
    this.renderer.dispose();
    this.root.removeChild(this.renderer.domElement);
    this.root.removeChild(this.hudEl);
  }
}
