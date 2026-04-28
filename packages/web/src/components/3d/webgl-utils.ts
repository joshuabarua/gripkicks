export function compileShader(gl: WebGLRenderingContext | WebGL2RenderingContext, type: number, source: string, componentName: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`[${componentName}] shader compile error:`, gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createProgram(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexShader: WebGLShader | null, fragmentShader: WebGLShader | null, componentName: string) {
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`[${componentName}] program link error:`, gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);
  return program;
}

export function parseHex(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function setupCanvasResize(canvas: HTMLCanvasElement, gl: WebGLRenderingContext | WebGL2RenderingContext) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return { ro, resize };
}

export interface RenderLoopState {
  raf: number;
  elapsed: number;
  last: number;
}

export function startRenderLoop(render: (dt: number, state: RenderLoopState) => void): RenderLoopState {
  const state: RenderLoopState = {
    raf: 0,
    elapsed: 0,
    last: performance.now(),
  };

  const loop = (now: number) => {
    state.raf = requestAnimationFrame(loop);
    const dt = (now - state.last) / 1000;
    state.last = now;
    render(dt, state);
  };
  state.raf = requestAnimationFrame(loop);

  return state;
}

export function stopRenderLoop(state: RenderLoopState) {
  cancelAnimationFrame(state.raf);
}
