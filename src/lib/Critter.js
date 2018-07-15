import CM from './CritterMain';

export default class Critter {
  constructor() {
    this.color = '#000000';
    this.turn = 0;
    this.height = 0;
    this.width = 0;
    this.coords = { x: 0, y: 0 };
    this.neighbors = {};

    // constants
    this.Attack = CM.Attack;
    this.Direction = CM.Direction;
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
}
