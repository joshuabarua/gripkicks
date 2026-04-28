"use client";

import { useEffect, useRef } from "react";
import { compileShader, parseHex, setupCanvasResize } from "./webgl-utils";

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_density;
uniform float u_speed;
uniform float u_rotation;
uniform int u_layers;
uniform vec3 u_sky;
uniform vec3 u_cloud;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 78.233);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p, float density) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  for (int i = 0; i < 5; i++) {
    if (float(i) >= density) break;
    v += a * noise(p);
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= 0.5;
  uv = mat2(cos(u_rotation), -sin(u_rotation), sin(u_rotation), cos(u_rotation)) * uv;
  uv += 0.5;

  vec3 color = u_sky;
  float cloud = 0.0;

  if (u_layers >= 1) {
    float n1 = fbm(uv * 3.0 + u_time * u_speed * 0.05, u_density);
    cloud += smoothstep(0.4, 0.6, n1);
  }
  if (u_layers >= 2) {
    float n2 = fbm(uv * 3.0 + u_time * (u_speed * 0.1) * 0.07, u_density);
    cloud += smoothstep(0.4, 0.6, n2);
  }
  if (u_layers == 3) {
    float n3 = fbm(uv * 3.0 + u_time * (u_speed * 0.2) * 0.09, u_density);
    cloud += smoothstep(0.4, 0.6, n3);
  }

  cloud /= float(u_layers);
  color = mix(color, u_cloud, cloud);

  gl_FragColor = vec4(color, 1.0);
}
`;


interface CloudShaderProps {
  className?: string;
  paused?: boolean;
  density?: number;
  speed?: number;
  rotation?: number;
  layers?: 1 | 2 | 3;
  skyColor?: string;
  cloudColor?: string;
}

export default function CloudShader({
  className,
  paused = false,
  density = 5,
  speed = 1,
  rotation = 0,
  layers = 3,
  skyColor = "#99ccff",
  cloudColor = "#ffffff",
}: CloudShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({ paused, density, speed, rotation, layers, skyColor, cloudColor });

  useEffect(() => {
    propsRef.current = { paused, density, speed, rotation, layers, skyColor, cloudColor };
  }, [paused, density, speed, rotation, layers, skyColor, cloudColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      console.warn("[CloudShader] WebGL not supported; component disabled.");
      return;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER, "CloudShader");
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER, "CloudShader");
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[CloudShader] program link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
      gl.STATIC_DRAW,
    );
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uDensity = gl.getUniformLocation(program, "u_density");
    const uSpeed = gl.getUniformLocation(program, "u_speed");
    const uRotation = gl.getUniformLocation(program, "u_rotation");
    const uLayers = gl.getUniformLocation(program, "u_layers");
    const uSky = gl.getUniformLocation(program, "u_sky");
    const uCloud = gl.getUniformLocation(program, "u_cloud");

    const { ro } = setupCanvasResize(canvas, gl);

    let raf = 0;
    let elapsed = 0;
    let last = performance.now();

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      const dt = (now - last) / 1000;
      last = now;
      const p = propsRef.current;
      if (!p.paused) elapsed += dt;

      const [sr, sg, sb] = parseHex(p.skyColor);
      const [cr, cg, cb] = parseHex(p.cloudColor);

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed * p.speed);
      gl.uniform1f(uDensity, p.density);
      gl.uniform1f(uSpeed, p.speed);
      gl.uniform1f(uRotation, p.rotation);
      gl.uniform1i(uLayers, p.layers);
      gl.uniform3f(uSky, sr, sg, sb);
      gl.uniform3f(uCloud, cr, cg, cb);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
