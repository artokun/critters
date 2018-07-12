import CM from './CritterMain';

export default class Critter {
  constructor() {
    this.color = '#000000';
    this.turn = 0;
    this.height = 0;
    this.width = 0;
    this.x = 10;
    this.y = 10;
    this.procreated = false;
    this.awake = true;
    this.foodEaten = 0;
    this.killCount = 0;
    this._neighbors = {
      NW: ' ',
      N: ' ',
      NE: ' ',
      W: ' ',
      CENTER: ' ',
      E: ' ',
      SW: ' ',
      S: ' ',
      SE: ' ',
    };

    // constants
    this.Attack = CM.Attack;
    this.Direction = CM.Direction;
  }

  get neighbors() {
    return this._neighbors;
  }

  set neighbors(neighbors) {
    this._neighbors = { ...neighbors };
  }

  eat() {
    return false;
  }

  fight(opponent) {
    // FORFEIT, ROAR, POUNCE, SCRATCH
    return this.Attack.FORFEIT;
  }

  getColor() {
    // #??????
    return (this.color = '#000000');
  }

  getMove() {
    // NW N NE W CENTER E SW S SE
    return this.Direction.CENTER;
  }

  toString() {
    return '?';
  }

  // The following methods are provided to get information
  // about the critter.

  dimensions() {
    return { width: this.width, height: this.height };
  }

  neighbor(direction) {
    return this.neighbors[direction];
  }

  get coords() {
    return { x: this.x, y: this.y };
  }

  set coords({ x, y }) {
    this.turn++;
    this.x = x;
    this.y = y;
  }

  // These methods are provided to inform you about the result
  // of fights, sleeping, etc.

  // called when you win a fight against another animal
  win(opponent) {}

  // called when you lose a fight against another animal, and die
  lose(opponent) {}

  // called when your animal is put to sleep for eating too much food
  sleep() {}

  // called when your animal wakes up from sleeping
  wakeup() {}

  // called when the game world is reset
  reset() {}

  // called when your critter mates with another critter
  mate() {}

  // called when your critter is done mating with another critter
  mateEnd() {}

  // private methods

  setSettings(settings) {
    const validKeys = [
      'height',
      'width',
      'x',
      'y',
      'alive',
      'awake',
      'neighbors',
    ];
    Object.keys(settings).forEach(key => {
      if (validKeys.indexOf(key) >= 0) {
        this[key] = settings[key];
      }
    });
  }
}
