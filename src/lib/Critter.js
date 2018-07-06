export default class Critter {
  constructor() {
    this.color = '#000000';
    this.tick = 0;
    this.height = 0;
    this.width = 0;
    this.x = 10;
    this.y = 10;
    this.alive = true;
    this.awake = true;
    this.neighbors = {
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
    this.Attack = {
      FORFEIT: 'FORFEIT',
      ROAR: 'ROAR',
      POUNCE: 'POUNCE',
      SCRATCH: 'SCRATCH',
    };
    this.Direction = {
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
  }

  eat() {
    return false;
  }

  fight(opponent) {
    return this.Attack.FORFEIT;
  }

  getColor() {
    return (this.color = '#000000');
  }

  getMove() {
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
    this.tick++;
    this.x = x;
    this.y = y;
  }

  // These methods are provided to inform you about the result
  // of fights, sleeping, etc.

  // called when you win a fight against another animal
  win() {}

  // called when you lose a fight against another animal, and die
  lose() {}

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
