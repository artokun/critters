import Critter from './Critter';

export default class Bear extends Critter {
  constructor(isGrizzly) {
    super();
    this.color = isGrizzly ? 'rgb(190,110,50)' : 'white';
    this.traveledNorth = false;
  }

  eat() {
    return true;
  }

  fight(opponent) {
    return this.Attack.SCRATCH;
  }

  getColor() {
    return this.color;
  }

  getMove() {
    if (!this.traveledNorth) {
      this.traveledNorth = true;
      return this.Direction.N;
    }
    this.traveledNorth = false;
    return this.Direction.W;
  }

  toString() {
    return 'B';
  }
}
