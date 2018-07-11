import React, { Component } from 'react';
import CritterMain from 'lib/CritterMain';
import Lion from 'lib/Lion';
// import Tiger from 'lib/Tiger';
import Bear from 'lib/Bear';

class Main extends Component {
  state = {
    availableFood: 0,
  };

  componentDidMount() {
    this.game = new CritterMain(this.canvas, [Bear, Lion], 25);
    this.monitor(this.game.fps);
  }

  monitor = fps => {
    window.setTimeout(this.updateScores, 1000 / fps);
  };

  updateScores = () => {
    const scores = this.game.animals.reduce((prev, curr) => {
      let critter = prev[curr.constructor.name] || {};
      let newCritter = {
        ...critter,
        alive: critter.alive ? critter.alive + 1 : 1,
        foodEaten: (critter.foodEaten ? critter.foodEaten : 0) + curr.foodEaten,
      };
      prev[curr.constructor.name] = newCritter;
      return prev;
    }, {});

    this.setState({
      scores,
      availableFood: this.game.availableFood,
    });

    // loop
    this.monitor(this.game.fps);
  };

  render() {
    return (
      <main>
        <canvas ref={ref => (this.canvas = ref)} />
        <ScoreBoard scores={this.state.scores} />
      </main>
    );
  }
}

class ScoreBoard extends Component {
  render() {
    return <pre>{JSON.stringify(this.props.scores, null, 2)}</pre>;
  }
}

export default Main;
