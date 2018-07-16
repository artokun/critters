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
    this.fps = 40;
    this.availableFood = 25;
    this.regenerateFood = true;
    this.foodPerTurn = [3, 25];
    this.foodPerSleep = [5, 3];

    // objects
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animals = [];
    this.food = [];
    this.critterClasses = critterClasses;
    this.critterCount = critterCount;
    this.critterStatus = []; //[[Critter, { ...status }], ...]
    this.defaultState = { turn: 0, foodEaten: 0, killCount: 0, alive: true };
    this.scores = {};

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
      if (Array.isArray(CritterClass)) {
        amount = CritterClass[1];
        CritterClass = CritterClass[0];
      }
      for (let i = 0; i < amount; i++) {
        switch (CritterClass.prototype.constructor.name) {
          case 'Bear':
            this.animals.push([
              new CritterClass(!!Math.round(Math.random())),
              { ...this.defaultState },
            ]);
            break;
          case 'Tiger':
            this.animals.push([
              new CritterClass(Math.floor(Math.random() * 10)),
              { ...this.defaultState },
            ]);
            break;
          default:
            this.animals.push([new CritterClass(), { ...this.defaultState }]);
        }
      }
    });

    // grow food
    for (let i = this.availableFood; i > 0; i--) {
      this.food.push([new Food(), { ...this.defaultState }]);
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
        gameObject[0].height = this.height;
        gameObject[0].width = this.width;
        gameObject[1].coords = { x, y };
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
        this.animals
          .filter(
            c =>
              !!c[1].alive &&
              c[1].turn === this.turn &&
              c[1].coords.x === X &&
              c[1].coords.y === Y
          )
          .forEach(critter => {
            // check for fullness
            if (critter.foodEaten) {
            }

            // ask critters where they want to move
            const n = this.getNextMove(critter);

            // ask critters if they want to fight/mate/eat
            this.fightOrMateOrEat(critter, n);

            // schedule next move
            critter[1].coords = { ...n };
            critter[0].coords = { ...n };
          });
      }
    }

    // get neighbors
    for (let i = this.animals.length - 1; i >= 0; i--) {
      this.getNeighbors(this.animals[i]);
    }

    // regenerate food over time
    if (this.regenerateFood) {
      // this.growXFoodEvery(...this.foodPerTurn);
    }

    // add shadows
    this.ctx.shadowColor = 'black';
    this.ctx.shadowOffsetX = -1;
    this.ctx.shadowOffsetY = 1;
    this.ctx.shadowBlur = 2;

    // paint food
    for (let i = this.food.length - 1; i >= 0; i--) {
      const food = this.food[i];
      if (food[1].alive) {
        this.ctx.fillStyle = food[0].getColor();
        this.ctx.fillText(
          food[0].toString(),
          food[1].coords.x * this.size + this.size / 2,
          food[1].coords.y * this.size + this.size / 2
        );
      }
    }

    // paint animals
    for (let i = this.animals.length - 1; i >= 0; i--) {
      // still alive? paint.
      const critter = this.animals[i];
      if (critter[1].alive) {
        this.ctx.fillStyle = critter[0].getColor() || 'black';
        this.ctx.fillText(
          critter[0].toString(),
          critter[1].coords.x * this.size + this.size / 2,
          critter[1].coords.y * this.size + this.size / 2
        );
      }
    }

    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.shadowBlur = 0;
    this.turn++;
  }

  growXFoodEvery(num, turns) {
    let numLeft = num;
    if (this.turn % turns === 0) {
      for (let i = numLeft; i > 0; i--) {
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);

        if (this.food.find(f => f[1].coords.x === x && f[1].coords.y === y)) {
          return this.growXFoodEvery(numLeft, turns);
        }
        this.food.push([
          new Food(),
          { ...this.defaultState, coords: { x, y } },
        ]);
        numLeft--;
      }
    }
  }

  fightOrMateOrEat(critter, n) {
    const opponents = this.animals.filter(
      c => !!c[1].alive && c[1].coords.x === n.x && c[1].coords.y === n.y
    );
    const foods = this.food.filter(
      f => !!f[1].alive && f[1].coords.x === n.x && f[1].coords.y === n.y
    );

    // critter found food
    if (foods && foods.length) {
      if (critter[0].eat()) {
        critter[1].foodEaten++;
        foods.forEach(f => {
          f[1].alive = false;
        });
      }
    }

    // no critter
    if (opponents.length === 0) {
      return;
    }
    opponents.forEach(opponent => {
      const critterSpecies = critter[0].constructor.name;
      const opponentSpecies = opponent ? opponent[0].constructor.name : null;

      // critters are of different species; fight to the death!
      if (opponentSpecies !== critterSpecies) {
        const isWinner = this.resolveFight(
          critter[0].fight(opponent[0].toString()),
          opponent[0].fight(critter[0].toString())
        );
        if (isWinner) {
          critter[0].win(opponent[0].toString());
          opponent[0].lose(critter[0].toString());
          critter[1].killCount++;
          opponent[1].alive = false;
          // console.log(critterSpecies, 'killed', opponentSpecies);
        } else {
          critter[0].lose(opponent[0].toString());
          opponent[0].win(critter[0].toString());
          opponent[1].killCount++;
          critter[1].alive = false;
          // console.log(opponentSpecies, 'killed', critterSpecies);
        }
      } else if (critter !== opponent) {
        // console.log('two', critterSpecies + 's', 'had a quicky.');
      }
    });
  }

  resolveFight(C, O) {
    const { ROAR, POUNCE, SCRATCH, FORFEIT } = CritterMain.Attack;

    if (C === ROAR) {
      switch (O) {
        case POUNCE:
          return false;
        case SCRATCH:
          return true;
        case FORFEIT:
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
        case FORFEIT:
          return true;
        default:
          return !!Math.round(Math.random());
      }
    } else if (C === SCRATCH) {
      switch (O) {
        case ROAR:
          return false;
        case POUNCE:
          return true;
        case FORFEIT:
          return true;
        default:
          return !!Math.round(Math.random());
      }
    } else if (C === FORFEIT) {
      return false;
    }
  }

  getNextMove(critter) {
    const { x, y } = critter[1].coords;
    const topEdge = y === 0;
    const rightEdge = x === this.width - 1;
    const bottomEdge = y === this.height - 1;
    const leftEdge = x === 0;

    // end critter turn
    critter[1].turn++;

    // send back next coordinate
    switch (critter[0].getMove()) {
      case 'NW':
        return topEdge
          ? leftEdge
            ? { y: this.width - 1, x: this.height - 1 }
            : { y: this.height - 1, x: x - 1 }
          : leftEdge
            ? { y: y - 1, x: this.width - 1 }
            : { y: y - 1, x: x - 1 };
      case 'N':
        return topEdge ? { y: this.height - 1, x } : { y: y - 1, x };
      case 'NE':
        return topEdge
          ? rightEdge
            ? { y: this.height - 1, x: 0 }
            : { y: this.height - 1, x: x + 1 }
          : rightEdge
            ? { y: y - 1, x: 0 }
            : { y: y - 1, x: x + 1 };
      case 'W':
        return leftEdge ? { y, x: this.width - 1 } : { y, x: x - 1 };
      case 'E':
        return rightEdge ? { y, x: 0 } : { y, x: x + 1 };
      case 'SW':
        return bottomEdge
          ? leftEdge
            ? { y: 0, x: this.width - 1 }
            : { y: 0, x: x - 1 }
          : leftEdge
            ? { y: y + 1, x: this.width - 1 }
            : { y: y + 1, x: x - 1 };
      case 'S':
        return bottomEdge ? { y: 0, x } : { y: y + 1, x };
      case 'SE':
        return bottomEdge
          ? rightEdge
            ? { y: 0, x: 0 }
            : { y: 0, x: x + 1 }
          : rightEdge
            ? { y: y - 1, x: 0 }
            : { y: y + 1, x: x + 1 };
      default:
        return { y, x };
    }
  }

  findObject({ x, y }) {
    const animal = this.animals.find(a => {
      const c = a[1].coords;
      return c.x === x && c.y === y;
    });
    const food = this.food.find(f => {
      const c = f[1].coords;
      return c.x === x && c.y === y;
    });
    return animal ? animal[0].toString() : food ? food[0].toString() : ' ';
  }

  getNeighbors(critter) {
    if (critter[1].turn !== this.turn + 1) {
      return;
    }
    const { x, y } = critter[1].coords;
    const topEdge = y === 0;
    const rightEdge = x === this.width - 1;
    const bottomEdge = y === this.height - 1;
    const leftEdge = x === 0;

    critter[0].neighbors = {
      NW: topEdge
        ? leftEdge
          ? this.findObject({ y: this.width - 1, x: this.height - 1 })
          : this.findObject({ y: this.height - 1, x: x - 1 })
        : leftEdge
          ? this.findObject({ y: y - 1, x: this.width - 1 })
          : this.findObject({ y: y - 1, x: x - 1 }),
      N: topEdge
        ? this.findObject({ y: this.height - 1, x })
        : this.findObject({ y: y - 1, x }),
      NE: topEdge
        ? rightEdge
          ? this.findObject({ y: this.height - 1, x: 0 })
          : this.findObject({ y: this.height - 1, x: x + 1 })
        : rightEdge
          ? this.findObject({ y: y - 1, x: 0 })
          : this.findObject({ y: y - 1, x: x + 1 }),
      W: leftEdge
        ? this.findObject({ y, x: this.width - 1 })
        : this.findObject({ y, x: x - 1 }),
      E: rightEdge
        ? this.findObject({ y, x: 0 })
        : this.findObject({ y, x: x + 1 }),
      SW: bottomEdge
        ? leftEdge
          ? this.findObject({ y: 0, x: this.width - 1 })
          : this.findObject({ y: 0, x: x - 1 })
        : leftEdge
          ? this.findObject({ y: y + 1, x: this.width - 1 })
          : this.findObject({ y: y + 1, x: x - 1 }),
      S: bottomEdge
        ? this.findObject({ y: 0, x })
        : this.findObject({ y: y + 1, x }),
      SE: bottomEdge
        ? rightEdge
          ? this.findObject({ y: 0, x: 0 })
          : this.findObject({ y: 0, x: x + 1 })
        : rightEdge
          ? this.findObject({ y: y + 1, x: 0 })
          : this.findObject({ y: y + 1, x: x + 1 }),
    };
  }

  calculateScore() {
    this.scores = this.animals.reduce((prev, curr) => {
      let critter = prev[curr[0].constructor.name] || {};
      let newCritter = {
        ...critter,
        alive: (critter.alive ? critter.alive : 0) + curr[1].alive,
        foodEaten:
          (critter.foodEaten ? critter.foodEaten : 0) + curr[1].foodEaten,
        killCount:
          (critter.killCount ? critter.killCount : 0) + curr[1].killCount,
        score:
          (critter.score ? critter.score : 0) +
          curr[1].foodEaten +
          curr[1].killCount +
          curr[1].alive,
      };
      prev[curr[0].constructor.name] = newCritter;
      return prev;
    }, {});
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

    // update scores
    this.calculateScore();

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
