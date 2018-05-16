import * as React from 'react';
import '../style/App.css';
import { ISimulationState } from '../corn-model';

interface IProps {
  year: number;
  simulationState: ISimulationState;
}

interface IState {
  initialCorn: number;
  initialTrap: number;
  initialWorms: number;
  dayFirstCornEaten: number | null;
  totalCorn: number;
  totalTrap: number;
  totalWorm: number;
  infectedCorn: number;
  harvestCorn: number;
  simulationDay: number;
  simulationYear: number;
}

class SimulationStatistics extends React.Component<IProps, IState> {

  public state: IState = {
    initialCorn: 0,
    initialTrap: 0,
    initialWorms: 0,
    dayFirstCornEaten: null,
    totalCorn: 0,
    totalTrap: 0,
    totalWorm: 0,
    infectedCorn: 0,
    harvestCorn: 0,
    simulationDay: 0,
    simulationYear: 0
  };

  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    const { simulationStep, simulationDay, simulationYear, countCorn, countTrap, countWorm, infected } = nextProps.simulationState;

    let nextState = { totalCorn: countCorn, totalTrap: countTrap, totalWorm: countWorm,
                      infectedCorn: infected, simulationDay, simulationYear};
    if (!simulationStep) {
      nextState = Object.assign(nextState, {
                                  initialCorn: countCorn, initialTrap: countTrap,
                                  initialWorms: countWorm, dayFirstCornEaten: null
                                });
    }
    if ((prevState.dayFirstCornEaten == null) && (countCorn < prevState.initialCorn)) {
      nextState = Object.assign(nextState, { dayFirstCornEaten: simulationDay });
    }
    return nextState;
  }

  public render() {
    return (
      <div className="section stats">
        <h4>Statistics</h4>
        <div><span>Year: </span><span>{this.state.simulationYear + 1}</span></div>
        <div><span>Day: </span><span>{this.state.simulationDay}</span></div>
        <div><span>Corn planted: </span><span>{this.state.initialCorn}</span></div>
        <div><span>Corn remaining: </span><span>{this.state.totalCorn}</span></div>
        <div><span>First corn eaten: </span><span>{this.state.dayFirstCornEaten}</span></div>
        <div><span>Trap planted: </span><span>{this.state.initialTrap}</span></div>
        <div><span>Trap remaining: </span><span>{this.state.totalTrap}</span></div>
        <div><span>Worms: </span><span>{this.state.totalWorm}</span></div>
      </div>
    );
  }
}
export default SimulationStatistics;