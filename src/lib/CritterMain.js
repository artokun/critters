import shuffle from 'lodash/fp/shuffle';
import chunk from 'lodash/fp/chunk';
import flow from 'lodash/fp/flow';

class CritterMain {
  constructor(canvas, critters, critterCount) {
    // world settings
    this.height = 50;
    this.width = 60;
    this.size = 15;
    this.counter = 1;
    this.running = false;
    this.fps = 1;

    // objects
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.critters = critters;
    this.critterCount = critterCount;

    this.gameObjects = [];

    // bindings
    this.draw = this.draw.bind(this);
    this.requestFrame = this.requestFrame.bind(this);

    // initialize
    this.init();
  }

  init() {
    this.setCanvasSize();
    this.placeCritters(this.critters, this.critterCount);
    this.requestFrame();
  }

  setCanvasSize() {
    this.canvas.height = this.height * this.size;
    this.canvas.width = this.width * this.size;
  }

  getCanvasSize() {
    return {
      height: this.height * this.size,
      width: this.width * this.size,
    };
  }

  placeCritters(critterClasses, amount) {
    // create field
    let field = new Array(this.height * this.width).fill(null);
    let animals = [];

    // create animals
    critterClasses.forEach(CritterClass => {
      for (let i = 0; i < amount; i++) {
        animals.push(new CritterClass());
      }
    });

    // add animals to the field and shuffle
    field.splice(0, animals.length, ...animals);
    this.gameObjects = flow(
      shuffle,
      chunk(this.width)
    )(field);
  }

  update() {
    this.ctx.fillStyle = 'lightgreen';
    this.ctx.fillRect(0, 0, this.width * this.size, this.height * this.size);
    this.gameObjects.forEach((row, y) => {
      row.forEach((obj, x) => {
        this.ctx.lineWidth = 0.25;
        this.ctx.strokeStyle = 'gray';
        this.ctx.strokeRect(x * this.size, y * this.size, this.size, this.size);
        if (!obj) return;
        obj.x = x;
        obj.y = y;
        obj.height = this.height;
        obj.width = this.width;
        obj.neighbors = this.getNeighbors(x, y);
        this.ctx.fillStyle = obj.getColor();
        this.ctx.font = `${this.size * 0.8}px arial`;
        this.ctx.fillText(
          obj.toString(),
          x * this.size + this.size * 0.28,
          y * this.size - this.size * 0.2
        );
      });
    });
  }

  getNeighbors(x, y) {
    const go = this.gameObjects;
    const topEdge = y === 0;
    const rightEdge = x === this.width - 1;
    const bottomEdge = y === this.height - 1;
    const leftEdge = x === 0;

    const ordinalClasses = {
      NW: topEdge
        ? leftEdge
          ? go[this.height - 1][this.width - 1]
          : go[this.height - 1][x - 1]
        : go[y - 1][x - 1],
      N: topEdge ? go[this.height - 1][x] : go[y - 1][x],
      NE: topEdge
        ? rightEdge
          ? go[this.height - 1][0]
          : go[this.height - 1][x + 1]
        : go[y - 1][x + 1],
      W: leftEdge ? go[y][this.width - 1] : go[y][x - 1],
      CENTER: go[y][x],
      E: rightEdge ? go[y][0] : go[y][x + 1],
      SW: bottomEdge
        ? leftEdge
          ? go[0][this.width - 1]
          : go[0][x - 1]
        : go[y + 1][x - 1],
      S: bottomEdge ? go[0][x] : go[y + 1][x],
      SE: bottomEdge ? (rightEdge ? go[0][0] : go[0][x + 1]) : go[y + 1][x + 1],
    };

    let neighbors = {};
    Object.keys(ordinalClasses).forEach(key => {
      neighbors[key] =
        ordinalClasses && ordinalClasses[key]
          ? ordinalClasses[key].toString()
          : ' ';
    });

    return neighbors;
  }

  draw() {
    // clear canvas
    this.ctx.clearRect(
      0,
      0,
      this.canvas.height * this.size,
      this.canvas.width * this.size
    );

    // canvas visuals
    this.update();

    // request next animation frame
    window.setTimeout(this.requestFrame, 1000 / this.fps);
  }

  requestFrame() {
    if (this.fps > 0) {
      window.requestAnimationFrame(this.draw);
    }
  }
}

export default CritterMain;
