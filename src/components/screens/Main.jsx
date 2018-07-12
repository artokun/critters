import React, { Component } from 'react';
import styled from 'styled-components';
import CritterMain from 'lib/CritterMain';
import Lion from 'lib/Lion';
import Tiger from 'lib/Tiger';
import Bear from 'lib/Bear';
import Vegan from 'lib/Vegan';

class Main extends Component {
  state = {
    availableFood: 0,
  };

  componentDidMount() {
    this.game = new CritterMain(
      this.canvas,
      [Bear, Lion, Tiger, [Vegan, 1]],
      25
    );
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
        killCount: (critter.killCount ? critter.killCount : 0) + curr.killCount,
        score:
          (critter.score ? critter.score : 0) +
          curr.foodEaten +
          curr.killCount +
          1,
      };
      prev[curr.constructor.name] = newCritter;
      return prev;
    }, {});

    this.setState({
      scores,
      availableFood: this.game.food.length,
    });

    // loop
    this.monitor(this.game.fps);
  };

  render() {
    return (
      <MainWrapper>
        <canvas ref={ref => (this.canvas = ref)} />
        <ScoreBoard scores={this.state.scores} />
        <p>Food: {this.state.availableFood}</p>
      </MainWrapper>
    );
  }
}

class ScoreBoard extends Component {
  render() {
    return <pre>{JSON.stringify(this.props.scores, null, 2)}</pre>;
  }
}

const MainWrapper = styled.main`
  display: flex;
`;

export default Main;
