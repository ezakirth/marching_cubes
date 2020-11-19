export default class Graphics {
  constructor() {}

  init() {
    let body = document.querySelector("body");

    this.canvas = document.createElement("canvas");
    body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("webgl2");

    window.addEventListener("resize", () => {
      //   this.resize();
    });

    window.onresize = () => {};

    this.resize();

    return this.ctx;
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.viewportWidth = this.canvas.width;
    this.ctx.viewportHeight = this.canvas.height;
  }
}
