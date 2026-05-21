/** GLSL shaders for wormhole + gravitational lensing background */

export const wormholeVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const wormholeFragment = `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  uniform float uPulse;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);
    vec3 g; g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5 + uMouse.x * 0.06, 0.5 - uMouse.y * 0.06);
    vec2 delta = uv - center;
    float dist = length(delta);

    // Black hole lensing
    float lens = 0.12 / (dist + 0.08);
    vec2 warped = uv + normalize(delta) * lens * 0.035;
    warped += vec2(sin(uTime * 0.1 + uScroll * 2.0) * 0.002, cos(uTime * 0.08) * 0.002);

    float n1 = snoise(warped * 2.5 + uTime * 0.06) * 0.5 + 0.5;
    float n2 = snoise(warped * 5.0 - uTime * 0.1) * 0.5 + 0.5;
    float n3 = snoise(warped * 11.0 + uTime * 0.04) * 0.5 + 0.5;

    vec3 col = vec3(0.008, 0.012, 0.028);
    col = mix(col, vec3(0.04, 0.1, 0.22), n1 * 0.45);
    col = mix(col, vec3(0.12, 0.05, 0.25), n2 * 0.3);
    col = mix(col, vec3(0.02, 0.14, 0.2), n3 * 0.25);

    // Wormhole accretion ring
    float ringDist = abs(dist - 0.22 - uScroll * 0.05);
    float ring = smoothstep(0.06, 0.0, ringDist);
    col += vec3(0.2, 0.65, 0.95) * ring * (0.7 + uPulse * 0.5);

    // Event horizon
    float core = smoothstep(0.1, 0.0, dist);
    col *= (1.0 - core * 0.85);

    float vig = 1.0 - smoothstep(0.35, 0.9, dist);
    col *= mix(0.35, 1.0, vig);

    float dust = snoise(uv * 60.0 + uTime * 0.25);
    col += vec3(0.5, 0.65, 0.9) * smoothstep(0.78, 0.88, dust) * 0.12;

    gl_FragColor = vec4(col, 1.0);
  }
`;
