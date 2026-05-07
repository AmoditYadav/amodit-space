// Sun fragment shader — animated plasma surface with multi-octave noise
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float uTime;
uniform float uIntensity; // 0..1, used for intro ignition ramp

// Simplex noise (duplicated for fragment)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  // Multi-octave noise for plasma surface
  float t = uTime * 0.12;
  vec3 noiseCoord = vPosition * 3.0;
  
  float n1 = snoise(noiseCoord + t) * 0.5;
  float n2 = snoise(noiseCoord * 2.0 - t * 1.3) * 0.25;
  float n3 = snoise(noiseCoord * 4.0 + t * 0.7) * 0.125;
  float n4 = snoise(noiseCoord * 8.0 - t * 0.5) * 0.0625;
  
  float noise = n1 + n2 + n3 + n4;
  
  // Color gradient: white-yellow core → orange → deep red edges
  vec3 coreColor = vec3(1.0, 0.98, 0.9);   // Near-white
  vec3 midColor  = vec3(1.0, 0.75, 0.3);   // Warm orange
  vec3 edgeColor = vec3(0.9, 0.35, 0.1);   // Deep orange-red
  
  // Fresnel for edge detection
  float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
  fresnel = pow(fresnel, 1.5);
  
  // Mix colors based on noise + fresnel
  float colorFactor = clamp(noise * 0.5 + 0.5 + fresnel * 0.3, 0.0, 1.0);
  vec3 color = mix(coreColor, midColor, colorFactor);
  color = mix(color, edgeColor, fresnel * 0.6);
  
  // Subtle dark granulation pattern
  float granulation = snoise(vPosition * 15.0 + t * 0.3) * 0.08;
  color -= granulation;
  
  // Pulsing intensity
  float pulse = 1.0 + sin(uTime * 0.4) * 0.05 + sin(uTime * 1.1) * 0.03;
  
  // Apply intensity (for intro fade-in)
  color *= pulse * uIntensity;
  
  // HDR output (will be picked up by bloom)
  gl_FragColor = vec4(color * 1.8, 1.0);
}
