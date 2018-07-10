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
    const { N, E, S, W } = this.Direction;

    this.steps++;
    switch (true) {
      case this.steps < 6:
        return S;
      case this.steps < 12:
        return W;
      case this.steps < 18:
        return N;
      case this.steps < 24:
        return E;
      default:
        this.steps = 0;
        return S;
    }
  }

  toString() {
    return 'L';
  }
}
