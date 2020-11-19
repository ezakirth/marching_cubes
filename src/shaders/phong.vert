precision mediump float;

uniform mat4 u_modelViewProjection;
uniform mat4 u_modelInverseTranspose;

attribute vec4 position;
attribute vec3 normal;

varying vec4 v_position;
varying vec3 v_normal;

void main() {
  v_position = u_modelViewProjection * position;
  v_normal = (u_modelInverseTranspose * vec4(normal, 0)).xyz;
  gl_Position = v_position;
}
