import * as React from 'react';
import '../App.css';
import { ISimulationState } from '../corn-model';

interface IProps {
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
}

export class SimulationStatistics extends React.Component<IProps, IState> {

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
    simulationDay: 0
  };

  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    const { simulationStep, countCorn, countTrap, countWorm, infected } = nextProps.simulationState;
    const actualDay = Math.trunc(simulationStep / 3);

    let nextState = { totalCorn: countCorn, totalTrap: countTrap, totalWorm: countWorm,
                      infectedCorn: infected, simulationDay: actualDay };
    if (!simulationStep) {
      nextState = Object.assign(nextState, {
                                  initialCorn: countCorn, initialTrap: countTrap,
                                  initialWorms: countWorm, dayFirstCornEaten: null
                                });
    }
    if ((prevState.dayFirstCornEaten == null) && (countCorn < prevState.initialCorn)) {
      nextState = Object.assign(nextState, { dayFirstCornEaten: actualDay });
    }
    return nextState;
  }

  public render() {
    return (
      <div className="section stats">
        <h4>Statistics</h4>
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