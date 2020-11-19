precision mediump float;

varying vec3 v_normal;
uniform vec3 u_lightDir;
uniform vec4 u_diffuse;

void main() {
  vec3 norm = normalize(v_normal);
  float light = dot(u_lightDir, norm) * .5 + .5;
  gl_FragColor = vec4(u_diffuse.rgb * light, u_diffuse.a);
}