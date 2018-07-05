import React, { Component } from 'react';
import CritterMain from 'lib/CritterMain';
import Critter from 'lib/Critter';

class Main extends Component {
  state = {
    running: false,
    fps: 24,
    size: 50,
  };

  componentDidMount() {
    this.main = new CritterMain(this.canvas, [Critter], 25);
  }

  toggle = () => {
    this.setState(
      ({ running }) => ({ running: !running }),
      () => {
        this.main.fps = this.state.running ? this.state.fps : 0;
      }
    );
  };

  reset = () => {
    this.main.reset();
  };

  handleInputChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value });
  };

  render() {
    return (
      <main>
        <canvas ref={ref => (this.canvas = ref)} />
        <br />
        <button onClick={this.toggle}>
          {this.state.running ? 'Stop' : 'Start'}
        </button>
        <button onClick={this.reset}>Reset</button>
      </main>
    );
  }
}

export default Main;
