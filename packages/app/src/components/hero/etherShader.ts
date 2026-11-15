// Port of the web EtherField shader (packages/web/src/components/3d/EtherField.tsx)
// for a three.js ShaderMaterial. The full-screen plane ignores the camera.

export const ETHER_VERTEX = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

export const ETHER_FRAGMENT = /* glsl */ `
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uAmbient;
uniform vec3 uAccent;
uniform vec2 uMouse;
uniform float uMouseStrength;

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

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
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
  gl_FragColor = vec4(col, 1.0);
}
`;
