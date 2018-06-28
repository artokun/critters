class CritterMain {
  constructor() {
    // world settings
    this.delay = 100;
    this.tournamentMode = false;
    this.height = 50;
    this.width = 60;
    this.backgroundColor = '#fafafa';
  }

  generateWorld = () => {
    return new Array(this.height)
      .fill(null)
      .map(() => new Array(this.width).fill(' '));
  };
}

export default CritterMain;
