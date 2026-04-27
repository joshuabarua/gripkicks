"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec3 iMouse;

out vec4 outColor;

#define INVERT 1

float noise(vec2 p) {
  return smoothstep(-0.5, 0.9, sin((p.x - p.y) * 555.0) * sin(p.y * 1444.0)) - 0.4;
}

float fabric(vec2 p) {
  const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  float f = 0.4 * noise(p);
  f += 0.3 * noise(p = m * p);
  f += 0.2 * noise(p = m * p);
  return f + 0.1 * noise(m * p);
}

float silk(vec2 uv, float t) {
  float s = sin(5.0 * (uv.x + uv.y + cos(2.0 * uv.x + 5.0 * uv.y)) + sin(12.0 * (uv.x + uv.y)) - t);
  s = 0.7 + 0.3 * (s * s * 0.5 + s);
  s *= 0.9 + 0.6 * fabric(uv * min(iResolution.x, iResolution.y) * 0.0006);
  return s * 0.9 + 0.1;
}

float silkd(vec2 uv, float t) {
  float xy = uv.x + uv.y;
  float d = (5.0 * (1.0 - 2.0 * sin(2.0 * uv.x + 5.0 * uv.y)) + 12.0 * cos(12.0 * xy)) * cos(5.0 * (cos(2.0 * uv.x + 5.0 * uv.y) + xy) + sin(12.0 * xy) - t);
  return 0.005 * d * (sign(d) + 3.0);
}

void mainImage(out vec4 fragColor, vec2 fragCoord) {
  float mr = min(iResolution.x, iResolution.y);
  vec2 uv = fragCoord / mr;

  float t = iTime;
  uv.y += 0.03 * sin(8.0 * uv.x - t);

  if (iMouse.z > 1.0) {
    uv += smoothstep(0.5, 0.0, distance(iMouse.xy / mr, uv)) * 0.08;
  }

  float s = sqrt(silk(uv, t));
  float d = silkd(uv, t);

  vec3 c = vec3(s);
  c += 0.7 * vec3(1.0, 0.83, 0.6) * d;
  c *= 1.0 - max(0.0, 0.8 * d);
#if INVERT
  c = pow(c, 0.3 / vec3(0.52, 0.5, 0.4));
  c = 1.0 - c;
#else
  c = pow(c, vec3(0.52, 0.5, 0.4));
#endif

  fragColor = vec4(c, 1.0);
}

void main() {
  mainImage(outColor, gl_FragCoord.xy);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("[SilkWaves] shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

interface SilkWavesProps {
  className?: string;
  paused?: boolean;
  speed?: number;
}

export default function SilkWaves({ className, paused = false, speed = 1 }: SilkWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    mouseX: 0,
    mouseY: 0,
    mouseDown: 0,
    paused,
    speed,
  });

  useEffect(() => {
    stateRef.current.paused = paused;
    stateRef.current.speed = speed;
  }, [paused, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!gl) {
      console.warn("[SilkWaves] WebGL2 not supported; component disabled.");
      return;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[SilkWaves] program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uMouse = gl.getUniformLocation(program, "iMouse");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

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

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouseX = (e.clientX - rect.left) * dpr;
      stateRef.current.mouseY = (rect.height - (e.clientY - rect.top)) * dpr;
    };
    const handlePointerDown = () => {
      stateRef.current.mouseDown = 2;
    };
    const handlePointerUp = () => {
      stateRef.current.mouseDown = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    let raf = 0;
    const start = performance.now();
    let elapsed = 0;
    let last = start;

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      const dt = (now - last) / 1000;
      last = now;
      if (!stateRef.current.paused) {
        elapsed += dt * stateRef.current.speed;
      }

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform3f(uMouse, stateRef.current.mouseX, stateRef.current.mouseY, stateRef.current.mouseDown);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteVertexArray(vao);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
