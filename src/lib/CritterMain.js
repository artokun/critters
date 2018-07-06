import shuffle from 'lodash/fp/shuffle';
import chunk from 'lodash/fp/chunk';
import flow from 'lodash/fp/flow';

class CritterMain {
  constructor(canvas, critters, critterCount) {
    // world settings
    this.height = 50;
    this.width = 60;
    this.size = 15;
    this.tick = 0;
    this.running = false;
    this.fps = 4;

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
        switch (CritterClass.prototype.constructor.name) {
          case 'Bear':
            animals.push(new CritterClass(!!Math.round(Math.random())));
            break;
          case 'Tiger':
            animals.push(new CritterClass(Math.floor(Math.random() * 10)));
            break;
          default:
            animals.push(new CritterClass());
        }
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
    const c = this.ctx;
    // font styles
    c.font = `${this.size * 0.8}px arial`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    // background styles
    c.fillStyle = 'lightgreen';
    c.fillRect(0, 0, this.width * this.size, this.height * this.size);

    // grid styles
    c.lineWidth = 0.25;
    c.strokeStyle = 'gray';

    this.gameObjects.forEach((row, y) => {
      row.forEach((critter, x) => {
        c.strokeRect(x * this.size, y * this.size, this.size, this.size);

        if (!critter || critter.tick !== this.tick) return;

        critter.height = this.height;
        critter.width = this.width;
        critter.neighbors = this.getNeighbors(x, y);
        critter.coords = { x, y };

        this.moveCritter(critter, x, y);

        this.ctx.fillStyle = critter.getColor();
        this.ctx.fillText(
          critter.toString(),
          critter.x * this.size + this.size / 2,
          critter.y * this.size + this.size / 2
        );
      });
    });
    this.tick++;
  }

  moveCritter(critter, x, y) {
    const go = this.gameObjects;
    const topEdge = y === 0;
    const rightEdge = x === this.width - 1;
    const bottomEdge = y === this.height - 1;
    const leftEdge = x === 0;

    this.gameObjects[y][x] = null;

    switch (critter.getMove()) {
      case critter.Direction.NW:
        topEdge
          ? leftEdge
            ? (go[this.height - 1][this.width - 1] = critter)
            : (go[this.height - 1][x - 1] = critter)
          : (go[y - 1][x - 1] = critter);
        break;
      case critter.Direction.N:
        topEdge ? (go[this.height - 1][x] = critter) : (go[y - 1][x] = critter);
        break;
      case critter.Direction.NE:
        topEdge
          ? rightEdge
            ? (go[this.height - 1][0] = critter)
            : (go[this.height - 1][x + 1] = critter)
          : (go[y - 1][x + 1] = critter);
        break;
      case critter.Direction.W:
        leftEdge ? (go[y][this.width - 1] = critter) : (go[y][x - 1] = critter);
        break;
      case critter.Direction.E:
        rightEdge ? (go[y][0] = critter) : (go[y][x + 1] = critter);
        break;
      case critter.Direction.SW:
        bottomEdge
          ? leftEdge
            ? (go[0][this.width - 1] = critter)
            : (go[0][x - 1] = critter)
          : (go[y + 1][x - 1] = critter);
        break;
      case critter.Direction.S:
        bottomEdge ? (go[0][x] = critter) : (go[y + 1][x] = critter);
        break;
      case critter.Direction.SE:
        bottomEdge
          ? rightEdge
            ? (go[0][0] = critter)
            : (go[0][x + 1] = critter)
          : (go[y + 1][x + 1] = critter);
        break;
      default:
        go[y][x] = critter;
    }
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
