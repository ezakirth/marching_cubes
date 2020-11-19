precision mediump float;

uniform mat4 u_modelViewProjection;
uniform vec3 u_lightPos;
uniform mat4 u_model;
uniform mat4 u_viewInverse;
uniform mat4 u_modelInverseTranspose;

attribute vec4 position;
attribute vec3 normal;
attribute vec2 texcoord;

varying vec4 v_position;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

void main() {
  v_position = u_modelViewProjection * position;
  v_normal = (u_modelInverseTranspose * vec4(normal, 0)).xyz;
  v_surfaceToLight = u_lightPos - (u_model * position).xyz;
  v_surfaceToView = (u_viewInverse[3] - (u_model * position)).xyz;
  gl_Position = v_position;
}