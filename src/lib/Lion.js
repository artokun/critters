import Critter from './Critter';

export default class Lion extends Critter {
  constructor() {
    super();
    this.color = 'red';
    this.isHungry = false;
    this.steps = 0;
  }

  eat() {
    if (this.isHungry) {
      this.isHungry = false;
      return true;
    }
    return false;
  }

  fight(opponent) {
    this.isHungry = true;

    if (opponent === 'B') {
      return this.Attack.ROAR;
    }

    return this.Attack.POUNCE;
  }

  getColor() {
    return this.color;
  }

  getMove() {
    this.steps++;
    switch (true) {
      case this.steps <= 5:
        return this.Direction.S;
      case this.steps <= 10:
        return this.Direction.W;
      case this.steps <= 15:
        return this.Direction.N;
      case this.steps <= 20:
        return this.Direction.E;
      default:
        this.steps = 0;
        return this.Direction.S;
    }
  }

  toString() {
    return 'L';
  }
}
