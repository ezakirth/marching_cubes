import Graphics from "./Graphics.js";
import * as twgl from "../node_modules/twgl.js/dist/4.x/twgl-full.module.js";
import { vec3, vec4, mat4 } from "gl-matrix";
import "normalize.css";
import "./styles.scss";
import Chunk from "./Chunk.js";
import input from "./Input.js";

let graphics = new Graphics();

const gl = graphics.init();
input.init();
window.input = input;

const chunk = new Chunk();
chunk.createMesh();
console.log(chunk);
console.log("done");

import vfDefault from "./shaders/default.vert";
import fsDefault from "./shaders/default.frag";

import vfPhong from "./shaders/phong.vert";
import fsPhong from "./shaders/phong.frag";

const m4 = twgl.m4;

const defaultShader = twgl.createProgramInfo(gl, [vfDefault, fsDefault]);
const phongShader = twgl.createProgramInfo(gl, [vfPhong, fsPhong]);

const currentShader = phongShader;

let bufferInfo = twgl.createBufferInfoFromArrays(gl, {
  position: { numComponents: 3, data: chunk.vertices },
  indices: { numComponents: 3, data: chunk.indices },
  normal: { numComponents: 3, data: chunk.normals },
});

console.log(bufferInfo);

const uniforms = {
  u_lightDir: vec3.fromValues(1, 2, 3),
  u_lightPos: [-chunk.width / 2, (chunk.height * 3) / 4, -chunk.width / 2],
  u_ambient: [0.0, 0.0, 0.0, 1],
  u_diffuse: [0.8, 0.0, 0.0, 1],
  u_specular: [1, 1, 1, 1],
  u_shininess: 10,
};

vec3.normalize(uniforms.u_lightDir, uniforms.u_lightDir);

const fov = degToRad(45);
const zNear = 0.01;
const zFar = 10000;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

const projection = mat4.create();

const model = mat4.create();
const view = mat4.create();

const modelView = mat4.create();
const modelViewProjection = mat4.create();
const modelInverseTranspose = mat4.create();

let player = {
  x: chunk.width,
  y: (-chunk.width * 3) / 4,
  z: chunk.width,
  speed: chunk.width,
};

let then = 0;
function loop(now) {
  now *= 0.001;
  const deltaTime = now - then;
  then = now;
  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  input.update(player, deltaTime);
  mat4.perspective(projection, fov, aspect, zNear, zFar);

  mat4.identity(model);
  mat4.rotateY(model, model, degToRad(now * 10));
  mat4.translate(model, model, [-chunk.width / 2, 0, -chunk.width / 2]);
  mat4.translate(model, model, [0, Math.sin(degToRad(now * 100)), 0]);

  mat4.identity(view);
  mat4.rotateX(view, view, degToRad(input.pitch));
  mat4.rotateY(view, view, degToRad(input.yaw));
  mat4.translate(view, view, [player.x, player.y, player.z]);

  mat4.multiply(modelView, view, model);
  mat4.multiply(modelViewProjection, projection, modelView);

  mat4.copy(modelInverseTranspose, modelViewProjection);
  //  m4.transpose(m4.inverse(model), modelInverseTranspose);

  if (input.vector) {
    let view = modelView;
    let proj = projection;
    let viewport = [0, 0, gl.canvas.width, gl.canvas.height];
    let vec = unproject(input.vector, view, proj, viewport);
    console.log(vec);
    input.vector = null;
  }

  uniforms.u_modelInverseTranspose = modelInverseTranspose;
  uniforms.u_modelViewProjection = modelViewProjection;

  gl.useProgram(currentShader.program);
  twgl.setBuffersAndAttributes(gl, currentShader, bufferInfo);
  twgl.setUniforms(currentShader, uniforms);

  if (chunk.indexed) {
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
  } else {
    gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function degToRad(d) {
  return (d * Math.PI) / 180;
}

function rebuild() {
  chunk.createMesh();
  bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: chunk.vertices },
    indices: { numComponents: 3, data: chunk.indices },
    normal: { numComponents: 3, data: chunk.normals },
  });
}

function unproject(vec, view, proj, viewport) {
  var dest = vec3.create(); //output
  var m = mat4.create(); //view * proj
  var im = mat4.create(); //inverse view proj
  var v = vec4.create(); //vector
  var tv = vec4.create(); //transformed vector

  //apply viewport transform
  v[0] = ((vec[0] - viewport[0]) * 2.0) / viewport[2] - 1.0;
  v[1] = ((vec[1] - viewport[1]) * 2.0) / viewport[3] - 1.0;
  v[2] = vec[2];
  v[3] = 1.0;

  //build and invert viewproj matrix
  mat4.multiply(m, view, proj);
  if (!mat4.invert(im, modelViewProjection)) {
    return null;
  }

  vec4.transformMat4(tv, v, im);
  if (v[3] === 0.0) {
    return null;
  }

  dest[0] = tv[0] / tv[3];
  dest[1] = tv[1] / tv[3];
  dest[2] = tv[2] / tv[3];

  return dest;
}
