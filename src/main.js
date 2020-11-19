import Graphics from "./Graphics.js";
import * as twgl from "../node_modules/twgl.js/dist/4.x/twgl-full.module.js";
import "normalize.css";
import "./styles.scss";
import mouse from "./Mouse.js";
import keyboard from "./Keyboard.js";
import Chunk from "./Chunk.js";

let graphics = new Graphics();

const gl = graphics.init();

mouse.init();
keyboard.init();

const chunk = new Chunk();

chunk.createMesh();
console.log(chunk);
console.log("done");

import vfGoureaud from "./shaders/gouraud.vert";
import fsGoureaud from "./shaders/gouraud.frag";

import vfPhong from "./shaders/phong.vert";
import fsPhong from "./shaders/phong.frag";

import vfDefault from "./shaders/default.vert";
import fsDefault from "./shaders/default.frag";

const m4 = twgl.m4;

const gouraudShader = twgl.createProgramInfo(gl, [vfGoureaud, fsGoureaud]);
const phongShader = twgl.createProgramInfo(gl, [vfPhong, fsPhong]);
const defaultShader = twgl.createProgramInfo(gl, [vfDefault, fsDefault]);

const currentShader = defaultShader;

const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
  position: { numComponents: 3, data: chunk.vertices },
  indices: { numComponents: 3, data: chunk.indices },
  normal: { numComponents: 3, data: chunk.normals },
});

console.log(bufferInfo);

const uniforms = {
  u_lightPos: [-chunk.width / 2, (chunk.height * 3) / 4, -chunk.width / 2],
  u_ambient: [0.0, 0.0, 0.0, 1],
  u_diffuse: [0.8, 0.0, 0.0, 1],
  u_specular: [1, 1, 1, 1],
  u_shininess: 10,
};

const player = {
  x: -chunk.width / 2,
  y: (chunk.height * 3) / 4,
  z: -chunk.width / 2,
  elev: 15,
  ang: 130,
  roll: 0,
  speed: chunk.width / 2,
  turnSpeed: 90,
};

window.player = player;

const fov = degToRad(45);
const zNear = 0.01;
const zFar = 10000;

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

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const projection = m4.perspective(fov, aspect, zNear, zFar);

  const camera = m4.identity();
  m4.translate(camera, [player.x, player.y, player.z], camera);
  m4.rotateX(camera, degToRad(player.elev), camera);
  m4.rotateY(camera, degToRad(-player.ang), camera);
  m4.rotateZ(camera, degToRad(player.roll), camera);
  // m4.scale(camera, [1, 1, 0.2], camera);

  const view = m4.inverse(camera);
  const viewProjection = m4.multiply(projection, view);
  const model = m4.identity(); //m4.rotationY(now); //m4.multiply(m4.rotationX(now), m4.rotationY(now));

  uniforms.u_modelInverseTranspose = m4.transpose(m4.inverse(model));
  uniforms.u_modelViewProjection = m4.multiply(viewProjection, model);
  uniforms.u_modelView = m4.multiply(view, model);
  uniforms.u_projection = projection;

  // default
  uniforms.u_viewInverse = camera;
  uniforms.u_model = model;

  // gouraud
  const modelviewInv = m4.inverse(uniforms.u_modelView);
  uniforms.u_normalMat = m4.transpose(modelviewInv);

  gl.useProgram(currentShader.program);
  twgl.setBuffersAndAttributes(gl, currentShader, bufferInfo);
  twgl.setUniforms(currentShader, uniforms);

  if (chunk.indexed) {
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
  } else {
    gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
  }

  /*
  gl.useProgram(programInfoWF.program);
  twgl.setBuffersAndAttributes(gl, programInfoWF, bufferInfo);
  twgl.setUniforms(programInfoWF, uniforms);
  gl.drawElements(gl.LINES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
*/

  if (keyboard.key.ArrowUp || keyboard.key.ArrowDown) {
    const direction = keyboard.key.ArrowUp ? 1 : -1;
    player.x -= camera[8] * deltaTime * player.speed * direction;
    player.y -= camera[9] * deltaTime * player.speed * direction;
    player.z -= camera[10] * deltaTime * player.speed * direction;
  }

  if (keyboard.key.ArrowLeft || keyboard.key.ArrowRight) {
    const direction = keyboard.key.ArrowRight ? 1 : -1;
    player.ang += deltaTime * player.turnSpeed * direction;
  }

  if (keyboard.key.KeyA) {
    player.y -= deltaTime * player.speed;
  }

  if (keyboard.key.KeyQ) {
    player.y += deltaTime * player.speed;
  }

  /*
  if (keys['81'] || keys['69']) {
    const direction = keys['81'] ? 1 : -1;
    player.roll += deltaTime * turnSpeed * direction;
  }*/

  if (keyboard.key.PageUp || keyboard.key.PageDown) {
    const direction = keyboard.key.PageUp ? 1 : -1;
    player.elev += deltaTime * player.turnSpeed * direction;
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function degToRad(d) {
  return (d * Math.PI) / 180;
}
