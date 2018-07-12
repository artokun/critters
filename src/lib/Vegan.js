import Critter from './Critter';
import difference from 'lodash/difference';

export default class Vegan extends Critter {
  constructor() {
    super();
    this.fear = false;
  }

  eat() {
    return true;
  }

  fight(opponent) {
    return this.Attack.FORFEIT;
  }

  getColor() {
    return this.color;
  }

  getMove() {
    const avoid = Object.entries(this.neighbors)
      .filter(n => [' ', 'ಠ_ಠ', '•ᴗ•', ','].indexOf(n[1]) === -1)
      .map(d => d[0]);
    const fancy = Object.entries(this.neighbors)
      .filter(n => ['ಠ_ಠ', '•ᴗ•', ','].indexOf(n[1]) !== -1)
      .map(d => d[0]);

    if (avoid.length) {
      this.fear = true;
      const escapeVectors = difference(Object.keys(this.Direction), avoid);
      switch (avoid[0]) {
        case 'N':
        case 'NE':
        case 'NW':
          return this.Direction.S;
        case 'E':
          return this.Direction.W;
        case 'W':
          return this.Direction.E;
        case 'S':
        case 'SE':
        case 'SW':
          return this.Direction.N;
        default:
          return this.Direction.CENTER;
      }
    } else if (fancy.length) {
      this.fear = false;
      return this.Direction[fancy[0]];
    }
    this.fear = false;
    return this.Direction.CENTER;
  }

  toString() {
    return this.fear ? 'ಠ_ಠ' : '•ᴗ•';
  }
}
