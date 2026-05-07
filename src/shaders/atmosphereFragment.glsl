// Atmosphere fragment shader — view-angle dependent glow
varying vec3 vNormal;
varying vec3 vViewDir;

uniform vec3 uColor;
uniform float uIntensity;

void main() {
  float fresnel = 1.0 - dot(vNormal, vViewDir);
  fresnel = pow(fresnel, 3.0);
  
  float alpha = fresnel * uIntensity;
  
  // Soft falloff at extreme edges
  alpha *= smoothstep(0.0, 0.4, fresnel);
  
  gl_FragColor = vec4(uColor, alpha);
}
