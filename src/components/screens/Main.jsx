import React, { Component } from 'react';
import CritterMain from 'lib/CritterMain';
import Lion from 'lib/Lion';
// import Tiger from 'lib/Tiger';
import Bear from 'lib/Bear';

class Main extends Component {
  componentDidMount() {
    this.main = new CritterMain(this.canvas, [Bear, Lion], 25);
  }

  render() {
    return (
      <main>
        <canvas ref={ref => (this.canvas = ref)} />
      </main>
    );
  }
}

export default Main;
