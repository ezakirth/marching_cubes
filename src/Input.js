import { v3 } from "../node_modules/twgl.js/dist/4.x/twgl-full.module.js";

const input = {
  active: false,
  current: { x: 0, y: 0 },
  previous: { x: 0, y: 0 },

  yaw: -230,
  pitch: 6,
  keyPressed: [],
  flying: true,

  init: function () {
    window.addEventListener("contextmenu", (event) => event.preventDefault());

    window.addEventListener(
      "mousemove",
      (e) => {
        input.current.x = e.clientX;
        input.current.y = e.clientY;

        if (input.active) {
          input.yaw += (input.current.x - input.previous.x) / 3;
          input.pitch += (input.current.y - input.previous.y) / 3;

          if (input.pitch > 90) input.pitch = 90;
          if (input.pitch < -90) input.pitch = -90;
        }

        input.previous.x = input.current.x;
        input.previous.y = input.current.y;
      },
      false
    );
    window.addEventListener("mouseup", (e) => (input.active = false), false);
    window.addEventListener(
      "mousedown",
      (e) => {
        if (e.button === 2) input.active = true;
      },
      false
    );
    window.addEventListener("click", (e) => {
      let x_pos = (e.clientX / window.innerWidth) * 2 - 1;
      let y_pos = -(e.clientY / window.innerHeight) * 2 + 1;
      let z_pos = 0.0;

      input.vector = v3.create(x_pos, y_pos, z_pos);
      /*
        var projector = new THREE.Projector();
        projector.unprojectVector(vector, camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(intersectObjects);
    
        if (intersects.length > 0) {
    
            xp = intersects[0].point.x.toFixed(2);
            yp = intersects[0].point.y.toFixed(2);
            zp = intersects[0].point.z.toFixed(2);  
            destination = new THREE.Vector3( xp , yp , zp );
    
            radians =  Math.atan2( ( driller.position.x - xp) , (driller.position.z - zp));
            radians += 90 * (Math.PI / 180);
            console.log(radians);
    
            var tween = new TWEEN.Tween(driller.rotation).to({ y : radians },200).easing(TWEEN.Easing.Linear.None).start();
    
        }*/
    });

    window.addEventListener(
      "keydown",
      (e) => (input.keyPressed[e.code] = true),
      false
    );
    window.addEventListener(
      "keyup",
      (e) => (input.keyPressed[e.code] = false),
      false
    );
  },

  update: function (player, deltaTime) {
    var speed = player.speed * deltaTime;

    var key = input.keyPressed;

    // left right
    if (key.ArrowLeft || key.ArrowRight || key.KeyA || key.KeyD) {
      if (key.ArrowLeft || key.KeyA) speed = -speed;
      if (key.ArrowRight || key.KeyD) speed = speed;
      player.x -= Math.cos((input.yaw * Math.PI) / 180) * speed;
      player.z -= Math.sin((input.yaw * Math.PI) / 180) * speed;
    }

    // shift / control
    if (
      key.KeyQ ||
      key.KeyE ||
      key.Space ||
      key.ShiftLeft ||
      key.ControlLeft ||
      key.ShiftRight ||
      key.ControlRight
    ) {
      if (key.KeyQ || key.Space || key.ShiftLeft || key.ShiftRight)
        speed = speed;
      if (key.KeyE || key.ControlLeft || key.ControlRight) speed = -speed;
      player.y -= 0.5 * speed;
    }

    // up down
    if (key.ArrowUp || key.ArrowDown || key.KeyW || key.KeyS) {
      if (key.ArrowUp || key.KeyW || input.autoRun) speed = speed;
      if (key.ArrowDown || key.KeyS) speed = -speed;
      if (input.flying) {
        player.x -=
          speed *
          Math.sin((input.yaw * Math.PI) / 180) *
          Math.cos((input.pitch * Math.PI) / 180);
        player.y += speed * Math.sin((input.pitch * Math.PI) / 180);
        player.z +=
          speed *
          Math.cos((input.yaw * Math.PI) / 180) *
          Math.cos((input.pitch * Math.PI) / 180);
      } else {
        player.x -= speed * Math.sin((input.yaw * Math.PI) / 180);
        player.z += speed * Math.cos((input.yaw * Math.PI) / 180);
      }
    }
  },
};

export default input;
