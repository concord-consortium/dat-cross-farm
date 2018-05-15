import * as React from 'react';
import '../App.css';
import {
  getCornStats
} from '../corn-model';
import { Environment, Events} from '../populations';

interface ISimulationState {
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

export class SimulationStatistics extends React.Component<{}, ISimulationState> {

  public state: ISimulationState = {
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

  public componentDidMount() {
    Events.addEventListener(Environment.EVENTS.STEP, (evt: any) => {
      let { dayFirstCornEaten } = this.state;
      const { countCorn, countTrap, countWorm, infected, simulationDay } = getCornStats();
      const actualDay = Math.trunc(simulationDay / 3);
      if ((this.state.dayFirstCornEaten == null) && (countCorn < this.state.initialCorn)) {
        dayFirstCornEaten = actualDay;
      }
      this.setState({
        totalCorn: countCorn, totalTrap: countTrap, totalWorm: countWorm,
        dayFirstCornEaten, infectedCorn: infected, simulationDay: actualDay
      });
    });

    Events.addEventListener(Environment.EVENTS.START, (evt: any) => {
      const { countCorn, countTrap, countWorm, infected } = getCornStats();
      this.setState({
        initialCorn: countCorn, initialTrap: countTrap, initialWorms: countWorm,
        dayFirstCornEaten: null, infectedCorn: infected
      });
    });

    Events.addEventListener(Environment.EVENTS.RESET, (evt: any) => {
      this.setState({
        initialCorn: 0, initialTrap: 0, initialWorms: 0,
        totalCorn: 0, totalTrap: 0, totalWorm: 0,
        dayFirstCornEaten: null, infectedCorn: 0, simulationDay: 0
      });
    });
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