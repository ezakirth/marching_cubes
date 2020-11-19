const keyboard = {
  x: 0,
  y: 0,
  key: {},
  init: function () {
    window.addEventListener("keydown", keydownEvent);
    window.addEventListener("keyup", keyupEvent);
  },
};

function keydownEvent(e) {
  keyboard.key[e.code] = true;
}

function keyupEvent(e) {
  keyboard.key[e.code] = false;
}

export default keyboard;
