precision mediump float;

uniform mat4 u_modelViewProjection;
uniform mat4 u_modelInverseTranspose;

uniform mat4 u_modelView;
uniform mat4 u_projection;
uniform mat4 u_normalMat;

attribute vec4 position;
attribute vec3 normal;


uniform vec3 u_lightPos;
uniform vec4 u_ambient;
uniform vec4 u_diffuse;
uniform vec4 u_specular;
uniform float u_shininess;

varying vec4 v_color;


void main() {
  vec4 pos = u_modelViewProjection * position;
  gl_Position = pos;

  vec3 N = normalize(normal);
  vec3 L = normalize(u_lightPos - pos.xyz);

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);      // Reflected light vector
    vec3 V = normalize(-pos.xyz); // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, u_shininess);
  }

  v_color = (u_ambient + lambertian * u_diffuse + specular * u_specular);

}
