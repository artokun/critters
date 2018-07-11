import shuffle from 'lodash/fp/shuffle';
import chunk from 'lodash/fp/chunk';
import flow from 'lodash/fp/flow';

class CritterMain {
  constructor(canvas, critterClasses, critterCount) {
    // world settings
    this.height = 50;
    this.width = 60;
    this.size = 15;
    this.turn = 0;
    this.fps = 4;
    this.availableFood = 25;
    this.regenerateFood = true;
    this.foodPerTurn = [3, 25];

    // objects
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animals = [];
    this.food = [];
    this.critterClasses = critterClasses;
    this.critterCount = critterCount;

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
    this.placeCritters(this.critterClasses, this.critterCount);
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

    // create animals
    critterClasses.forEach(CritterClass => {
      for (let i = 0; i < amount; i++) {
        switch (CritterClass.prototype.constructor.name) {
          case 'Bear':
            this.animals.push(new CritterClass(!!Math.round(Math.random())));
            break;
          case 'Tiger':
            this.animals.push(new CritterClass(Math.floor(Math.random() * 10)));
            break;
          default:
            this.animals.push(new CritterClass());
        }
      }
    });

    // grow food
    for (let i = this.availableFood; i > 0; i--) {
      this.food.push(new Food());
    }

    // add animals to the field and shuffle
    field.splice(
      0,
      this.animals.length + this.food.length,
      ...this.animals,
      ...this.food
    );

    // place game objects in a grid and assign
    let farm = flow(
      shuffle,
      chunk(this.width)
    )(field);

    farm.forEach((row, y) => {
      row.forEach((gameObject, x) => {
        // set initial values
        if (!gameObject) {
          return;
        }
        gameObject.height = this.height;
        gameObject.width = this.width;
        gameObject.coords = { x, y };
      });
    });
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

    for (let X = 0; X < this.width; X++) {
      for (let Y = 0; Y < this.height; Y++) {
        // draw black squares
        c.strokeRect(X * this.size, Y * this.size, this.size, this.size);

        // find critter
        const critters = this.animals.filter(c => c.x === X && c.y === Y);

        critters.forEach(critter => {
          if (critter && critter.turn === this.turn) {
            // ask critters where they want to move
            const n = this.getNextMove(critter);

            // ask critters if they want to fight/mate/eat
            this.fightOrMateOrEat(critter, n);

            // schedule next move
            critter.coords = { x: n.x, y: n.y };
          }
        });
      }
    }

    // regenerate food over time
    if (this.regenerateFood) {
      this.growXFoodEvery(...this.foodPerTurn);
    }

    // paint food
    this.food.forEach(food => {
      // still alive? paint.
      this.ctx.fillStyle = food.getColor();
      this.ctx.fillText(
        food.toString(),
        food.x * this.size + this.size / 2,
        food.y * this.size + this.size / 2
      );
    });

    // paint animals
    this.animals.forEach(critter => {
      // still alive? paint.
      this.ctx.fillStyle = critter.getColor();
      this.ctx.fillText(
        critter.toString(),
        critter.x * this.size + this.size / 2,
        critter.y * this.size + this.size / 2
      );
    });

    this.turn++;
  }

  growXFoodEvery(num, turns) {
    let numLeft = num;
    if (this.turn % turns === 0) {
      for (let i = numLeft; i > 0; i--) {
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);

        if (this.food.find(f => f.x === x && f.y === y)) {
          return this.growXFoodEvery(numLeft, turns);
        }
        this.food.push(new Food(x, y));
        numLeft--;
      }
    }
  }

  fightOrMateOrEat(critter, n) {
    const opponent = this.animals.find(c => c.x === n.x && c.y === n.y);
    const food = this.food.find(f => f.x === n.x && f.y === n.y);
    const critterSpecies = critter.constructor.name;
    const opponentSpecies = opponent ? opponent.constructor.name : null;

    // critter found food
    if (food) {
      const willEat = critter.eat();

      if (willEat) {
        critter.foodEaten = critter.foodEaten + 1;
        this.food.splice(this.food.indexOf(food), 1);
      }
      return;
    }

    // no critter
    if (!opponent) {
      return;
    }

    // critters are of different species; fight to the death!
    if (opponentSpecies !== critterSpecies) {
      const isWinner = this.resolveFight(
        critter.fight(opponent),
        opponent.fight(critter)
      );
      if (isWinner) {
        critter.win(opponent.toString());
        opponent.lose(critter.toString());
        critter.killCount = critter.killCount + 1;
        this.animals.splice(this.animals.indexOf(opponent), 1);
        console.log(critterSpecies, 'killed', opponentSpecies);
      } else {
        critter.lose(opponent.toString());
        opponent.win(critter.toString());
        opponent.killCount = opponent.killCount + 1;
        this.animals.splice(this.animals.indexOf(critter), 1);
        console.log(opponentSpecies, 'killed', critterSpecies);
      }
    } else {
      console.log('two', critterSpecies + 's', 'had a quicky.');
    }
  }

  eat(critter) {
    return null;
  }

  resolveFight(C, O) {
    const { ROAR, POUNCE, SCRATCH } = CritterMain.Attack;

    if (C === ROAR) {
      switch (O) {
        case POUNCE:
          return false;
        case SCRATCH:
          return true;
        default:
          return !!Math.round(Math.random());
      }
    } else if (C === POUNCE) {
      switch (O) {
        case ROAR:
          return true;
        case SCRATCH:
          return false;
        default:
          return !!Math.round(Math.random());
      }
    } else if (C === SCRATCH) {
      switch (O) {
        case ROAR:
          return false;
        case POUNCE:
          return true;
        default:
          return !!Math.round(Math.random());
      }
    }
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
  constructor(x = 0, y = 0) {
    this.Direction = CritterMain.Direction;
    this.x = x;
    this.y = y;
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
