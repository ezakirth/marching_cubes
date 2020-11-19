import Graphics from "./Graphics.js";
import * as twgl from "../node_modules/twgl.js/dist/4.x/twgl-full.module.js";
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
const v3 = twgl.v3;

const defaultShader = twgl.createProgramInfo(gl, [vfDefault, fsDefault]);
const phongShader = twgl.createProgramInfo(gl, [vfPhong, fsPhong]);

const currentShader = phongShader;

const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
  position: { numComponents: 3, data: chunk.vertices },
  indices: { numComponents: 3, data: chunk.indices },
  normal: { numComponents: 3, data: chunk.normals },
});

console.log(bufferInfo);

const uniforms = {
  u_lightDir: v3.normalize([1, 2, 3]),
  u_lightPos: [-chunk.width / 2, (chunk.height * 3) / 4, -chunk.width / 2],
  u_ambient: [0.0, 0.0, 0.0, 1],
  u_diffuse: [0.8, 0.0, 0.0, 1],
  u_specular: [1, 1, 1, 1],
  u_shininess: 10,
};

const fov = degToRad(45);
const zNear = 0.01;
const zFar = 10000;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

const projection = m4.identity();
const modelView = m4.identity();
const modelViewProjection = m4.identity();
const modelInverseTranspose = m4.identity();

let player = {
  x: chunk.width / 2,
  y: (-chunk.width * 3) / 4,
  z: chunk.width / 2,
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

  m4.perspective(fov, aspect, zNear, zFar, projection);
  m4.identity(modelView);
  m4.rotateX(modelView, degToRad(input.pitch), modelView);
  m4.rotateY(modelView, degToRad(input.yaw), modelView);
  m4.translate(modelView, [player.x, player.y, player.z], modelView);
  m4.multiply(projection, modelView, modelViewProjection);

  m4.copy(modelViewProjection, modelInverseTranspose);
  //  m4.transpose(m4.inverse(model), modelInverseTranspose);

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
