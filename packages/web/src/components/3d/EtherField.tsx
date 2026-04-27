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
uniform vec3 uAmbient;
uniform vec3 uAccent;
uniform vec2 uMouse;
uniform float uMouseStrength;

out vec4 outColor;

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float density(vec3 p) {
  p.xz = rot(iTime * 0.22) * p.xz;
  p.xy = rot(iTime * 0.15) * p.xy;
  vec3 q = p * 1.7 + iTime * 0.3;
  float swirl = sin(q.x + sin(q.y) * 0.6) * cos(q.z * 1.1);
  float shell = length(p + 0.35 * vec3(sin(iTime * 0.6), cos(iTime * 0.4), sin(iTime * 0.5)));
  float radial = log(length(p) + 1.0);
  return shell * radial + swirl * 0.45 - 1.15;
}

void mainImage(out vec4 fragColor, vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

  vec2 mouseNorm = (uMouse - 0.5 * iResolution.xy) / iResolution.y;
  float md = distance(mouseNorm, uv);
  float ripple = smoothstep(0.55, 0.0, md) * uMouseStrength;
  uv += (uv - mouseNorm) * ripple * 0.18;

  vec3 ro = vec3(0.0, 0.0, 4.6);
  vec3 rd = normalize(vec3(uv, -1.0 + ripple * 0.25));

  vec3 col = vec3(0.0);
  float dist = 2.0;

  for (int i = 0; i < 6; i++) {
    vec3 p = ro + rd * dist;
    float d = density(p);
    float grad = clamp((d - density(p + vec3(0.12))) * 0.5, -0.12, 1.0);
    vec3 layer = uAmbient + uAccent * grad;
    col = col * layer + smoothstep(2.2, 0.0, d) * 0.6 * layer;
    dist += min(d, 1.0);
  }

  col = pow(col, vec3(0.92));
  fragColor = vec4(col, 1.0);
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
    console.error("[EtherField] shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function parseHex(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

interface EtherFieldProps {
  className?: string;
  paused?: boolean;
  speed?: number;
  ambientColor?: string;
  accentColor?: string;
}

export default function EtherField({
  className,
  paused = false,
  speed = 1,
  ambientColor = "#0a1424",
  accentColor = "#ff5a3d",
}: EtherFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({ paused, speed, ambientColor, accentColor });
  const mouseRef = useRef({
    targetX: 0,
    targetY: 0,
    smoothX: 0,
    smoothY: 0,
    targetStrength: 0,
    smoothStrength: 0,
  });

  useEffect(() => {
    propsRef.current = { paused, speed, ambientColor, accentColor };
  }, [paused, speed, ambientColor, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true });
    if (!gl) {
      console.warn("[EtherField] WebGL2 not supported; component disabled.");
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
      console.error("[EtherField] program link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uAmbient = gl.getUniformLocation(program, "uAmbient");
    const uAccent = gl.getUniformLocation(program, "uAccent");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uMouseStrength = gl.getUniformLocation(program, "uMouseStrength");

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

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      const m = mouseRef.current;
      if (inside) {
        m.targetX = (e.clientX - rect.left) * dpr;
        m.targetY = (rect.height - (e.clientY - rect.top)) * dpr;
        m.targetStrength = 1;
      } else {
        m.targetStrength = 0;
      }
    };
    const handlePointerLeave = () => {
      mouseRef.current.targetStrength = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    window.addEventListener("blur", handlePointerLeave);

    let raf = 0;
    let elapsed = 0;
    let last = performance.now();

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      const dt = (now - last) / 1000;
      last = now;
      const p = propsRef.current;
      if (!p.paused) elapsed += dt * p.speed;

      const m = mouseRef.current;
      const ease = 1 - Math.pow(0.001, dt);
      m.smoothX += (m.targetX - m.smoothX) * ease;
      m.smoothY += (m.targetY - m.smoothY) * ease;
      m.smoothStrength += (m.targetStrength - m.smoothStrength) * ease;

      const [ar, ag, ab] = parseHex(p.ambientColor);
      const [cr, cg, cb] = parseHex(p.accentColor);

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform3f(uAmbient, ar, ag, ab);
      gl.uniform3f(uAccent, cr, cg, cb);
      gl.uniform2f(uMouse, m.smoothX, m.smoothY);
      gl.uniform1f(uMouseStrength, m.smoothStrength);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteVertexArray(vao);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
