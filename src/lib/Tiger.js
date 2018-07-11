import Critter from './Critter';

export default class Tiger extends Critter {
  constructor(hunger) {
    super();
    this.color = 'yellow';
    this.hunger = hunger;
    this.steps = 3;
    this.direction = this.Direction.CENTER;
  }

  eat() {
    if (this.hunger) {
      this.hunger -= 1;
      return true;
    }
    return false;
  }

  fight(opponent) {
    if (this.hunger) {
      return this.Attack.SCRATCH;
    }
    return this.Attack.POUNCE;
  }

  getColor() {
    return this.color;
  }

  getMove() {
    if (this.steps === 3) {
      this.steps = 0;
      this.direction = Object.keys(this.Direction)[
        Math.floor(Math.random() * 9)
      ];
    }
    this.steps++;
    return this.direction;
  }

  toString() {
    return this.hunger ? this.hunger.toString() : 'T';
  }
}
