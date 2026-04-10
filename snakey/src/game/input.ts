export type Direction = "up" | "down" | "left" | "right";

const keyToDir: Record<string, Direction | undefined> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

export type InputBindings = {
  onDirection: (dir: Direction) => void;
  /** Fired on pointer up when movement is below swipe threshold (e.g. tap). */
  onTap?: () => void;
};

/**
 * Keyboard + swipe (mobile) input. Pointer events are used so the canvas can
 * call preventDefault and avoid scroll/zoom while playing.
 */
export function attachInput(
  target: HTMLElement,
  { onDirection, onTap }: InputBindings,
): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    const dir = keyToDir[e.key];
    if (!dir) return;
    e.preventDefault();
    onDirection(dir);
  };

  let startX = 0;
  let startY = 0;
  let tracking = false;

  const onPointerDown = (e: PointerEvent) => {
    tracking = true;
    startX = e.clientX;
    startY = e.clientY;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 24;
    if (absX < threshold && absY < threshold) {
      onTap?.();
      return;
    }
    if (absX > absY) {
      onDirection(dx > 0 ? "right" : "left");
    } else {
      onDirection(dy > 0 ? "down" : "up");
    }
  };

  window.addEventListener("keydown", onKeyDown);
  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointerup", onPointerUp);
  target.addEventListener("pointercancel", onPointerUp);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointerup", onPointerUp);
    target.removeEventListener("pointercancel", onPointerUp);
  };
}
