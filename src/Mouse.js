const mouse = {
  x: 0,
  y: 0,
  active: false,
  init: function () {
    window.addEventListener("mousemove", mouseMoveEvent);
    window.addEventListener("mouseup", mouseUpEvent);
    window.addEventListener("mousedown", mouseDownEvent);
  },
};

function mouseMoveEvent(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
}

function mouseUpEvent(e) {
  mouse.active = false;
}

function mouseDownEvent(e) {
  mouse.active = true;
}

export default mouse;
