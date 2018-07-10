import shuffle from 'lodash/fp/shuffle';
import chunk from 'lodash/fp/chunk';
import flow from 'lodash/fp/flow';

class CritterMain {
  constructor(canvas, critters, critterCount) {
    // world settings
    this.height = 50;
    this.width = 60;
    this.size = 15;
    this.turn = 0;
    this.running = false;
    this.fps = 4;
    this.availableFood = 50;

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

  static Attack = {
    FORFEIT: 'FORFEIT',
    ROAR: 'ROAR',
    POUNCE: 'POUNCE',
    SCRATCH: 'SCRATCH',
  };

  static Direction = {
    NW: 'NW',
    N: 'N',
    NE: 'NE',
    E: 'E',
    CENTER: 'CENTER',
    W: 'W',
    SW: 'SW',
    S: 'S',
    SE: 'SE',
  };

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
    let food = [];

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

    // grow food
    for (let i = this.availableFood; i > 0; i--) {
      food.push(new Food());
    }

    // add animals to the field and shuffle
    field.splice(0, animals.length + food.length, ...animals, ...food);
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
    c.lineWidth = 1;
    c.strokeStyle = 'rgba(0,0,0,0.1)';

    this.gameObjects.forEach((row, y) => {
      row.forEach((critter, x) => {
        // draw black squares
        c.strokeRect(x * this.size, y * this.size, this.size, this.size);

        // check to see if critter has already moved this turn
        if (!critter || critter.turn !== this.turn) return;

        // set initial values
        if (this.turn === 0) {
          critter.height = this.height;
          critter.width = this.width;
          critter.coords = { x, y };
        }

        // ask critters where they want to move
        const n = this.getNextMove(critter);

        // ask critters if they want to fight/mate/eat
        this.fightOrMateOrEat(critter, n);

        // paint the animals in their new coordinates if

        // move critter
        critter.coords = { x: n.x, y: n.y };
        this.gameObjects[n.y][n.x] = critter;

        // still alive
        this.ctx.fillStyle = critter.getColor();
        this.ctx.fillText(
          critter.toString(),
          critter.x * this.size + this.size / 2,
          critter.y * this.size + this.size / 2
        );
      });
    });
    this.turn++;
  }

  fightOrMateOrEat(critter, n) {
    const opponent = this.gameObjects[n.y][n.x];
    const critterSpecies = critter.constructor.name;
    const opponentSpecies = opponent ? opponent.constructor.name : null;

    // no critter, or food
    if (!opponent) {
      return;
    } else if ([critterSpecies, opponentSpecies].indexOf('Food') >= 0) {
      return;
    } else {
    }

    // critters are of different species; fight to the death!
    if (opponentSpecies !== critterSpecies) {
      const opponentAttack = critter.fight(opponent);
      const critterAttack = opponent.fight(critter);
    }
  }

  eat(critter) {
    return null;
  }

  getNextMove(critter) {
    const { x, y } = critter.coords;
    const topEdge = y === 0;
    const rightEdge = x === this.width - 1;
    const bottomEdge = y === this.height - 1;
    const leftEdge = x === 0;

    switch (critter.getMove()) {
      case critter.Direction.NW:
        return topEdge
          ? leftEdge
            ? { y: this.width - 1, x: this.height - 1 }
            : { y: this.height - 1, x: x - 1 }
          : { y: y - 1, x: x - 1 };
      case critter.Direction.N:
        return topEdge ? { y: this.height - 1, x } : { y: y - 1, x };
      case critter.Direction.NE:
        return topEdge
          ? rightEdge
            ? { y: this.height - 1, x: 0 }
            : { y: this.height - 1, x: x + 1 }
          : { y: y - 1, x: x + 1 };
      case critter.Direction.W:
        return leftEdge ? { y, x: this.width - 1 } : { y, x: x - 1 };
      case critter.Direction.E:
        return rightEdge ? { y, x: 0 } : { y, x: x + 1 };
      case critter.Direction.SW:
        return bottomEdge
          ? leftEdge
            ? { y: 0, x: this.width - 1 }
            : { y: 0, x: x - 1 }
          : { y: y + 1, x: x - 1 };
      case critter.Direction.S:
        return bottomEdge ? { y: 0, x } : { y: y + 1, x };
      case critter.Direction.SE:
        return bottomEdge
          ? rightEdge
            ? { y: 0, x: 0 }
            : { y: 0, x: x + 1 }
          : { y: y + 1, x: x + 1 };
      default:
        return { y, x };
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

class Food {
  constructor() {
    this.Direction = CritterMain.Direction;
    this.x = 0;
    this.y = 0;
    this.turn = 0;
    this.height = 0;
    this.width = 0;
  }
  get coords() {
    return { x: this.x, y: this.y };
  }

  set coords({ x, y }) {
    this.turn++;
    this.x = x;
    this.y = y;
  }

  getColor() {
    return '#000000';
  }

  getMove() {
    return this.Direction.CENTER;
  }

  toString() {
    return ',';
  }
}

export default CritterMain;
