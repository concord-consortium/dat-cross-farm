import * as React from 'react';
import './App.css';
import { initCornModel, addCornDense, addCornSparse, addTrapCropDense, addTrapCropSparse,
          addWormsSparse, getCornStats } from './corn-model';
import { Events, Environment } from './populations';

interface IAppProps {
  simulationElt: HTMLElement | null;  // null is used for unit tests
}

interface IAppState {
  initialCorn: number;
  initialTrap: number;
  initialWorms: number;
  totalCorn: number;
  totalTrap: number;
  totalWorm: number;
  infectedCorn: number;
  harvestCorn: number;
  simulationDay: number;
}

class App extends React.Component<IAppProps, IAppState> {

  public state: IAppState = {
    initialCorn: 0,
    initialTrap: 0,
    initialWorms: 0,
    totalCorn: 0,
    totalTrap: 0,
    totalWorm: 0,
    infectedCorn: 0,
    harvestCorn: 0,
    simulationDay: 0
  };

  public componentDidMount() {
    initCornModel(this.props.simulationElt, {});

    Events.addEventListener(Environment.EVENTS.STEP, (evt: any) => {
      const { countCorn, countTrap, countWorm, infected, simulationDay } = getCornStats();
      const actualDay = Math.trunc(simulationDay / 3);
      this.setState({ totalCorn: countCorn, totalTrap: countTrap,
                      totalWorm: countWorm, infectedCorn: infected, simulationDay: actualDay });
    });

    Events.addEventListener(Environment.EVENTS.START, (evt: any) => {
      const { countCorn, countTrap, countWorm, infected } = getCornStats();
      this.setState({ initialCorn: countCorn, initialTrap: countTrap,
                      initialWorms: countWorm, infectedCorn: infected });
    });
  }

  public render() {
    return (
      <div className="ui">
        <button id="add-corn-dense" onClick={addCornDense}>
          Plant Corn Densely
        </button>
        <button id="add-corn-sparse" onClick={addCornSparse}>
          Plant Corn Sparsely
        </button>
        <br />
        <button id="add-trap-dense" onClick={addTrapCropDense}>
          Plant Trap Crop Densely
        </button>
        <button id="add-trap-sparse" onClick={addTrapCropSparse}>
          Plant Trap Crop Sparsely
        </button>
        <br/>
        <button id="add-worms-sparse" onClick={addWormsSparse}>
          Add Worms
        </button>
        <br/>
        <div style={{ margin: 5, padding: 5, border: '1px solid' }}>
          Day: <span>{this.state.simulationDay}</span><br />
          Corn planted: <span>{this.state.initialCorn}</span><br />
          Corn remaining: <span>{this.state.totalCorn}</span><br />
          Trap planted: <span>{this.state.initialTrap}</span><br />
          Trap remaining: <span>{this.state.totalTrap}</span><br />
          Worms: <span>{this.state.totalWorm}</span><br />
        </div>
      </div>
    );
  }
}

export default App;
