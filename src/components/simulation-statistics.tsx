import * as React from 'react';
import '../style/App.css';
import { ISimulationState } from '../corn-model';
import '../style/simulation-statistics.css';

export interface ISimulationYearState {
  initial: ISimulationState;
  final?: ISimulationState;
}

type SimulationStateExtractor = (yearState: ISimulationYearState) => number | undefined;

interface IProps {
  simulationState: ISimulationState;
  simulationHistory: ISimulationYearState[];
}

interface IState {
  initialCorn: number;
  initialTrap: number;
  initialWorms: number;
  dayFirstCornEaten: number | undefined;
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
    dayFirstCornEaten: undefined,
    totalCorn: 0,
    totalTrap: 0,
    totalWorm: 0,
    infectedCorn: 0,
    harvestCorn: 0,
    simulationDay: 0,
    simulationYear: 0
  };

  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    const { simulationStepInYear, simulationDay, simulationYear, countCorn, countTrap, countWorm, infected } = nextProps.simulationState;

    let nextState = { totalCorn: countCorn, totalTrap: countTrap, totalWorm: countWorm,
                      infectedCorn: infected, simulationDay, simulationYear};
    if (!simulationStepInYear) {
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

  renderYearHeaders() {
    const yearCells = [];
    for (let year = 0; year <= this.state.simulationYear; ++year) {
      yearCells.push(
        <th className="column-header" scope="col" key={year + 1}>
          Yr {year + 1}
        </th>
      );
    }
    return yearCells;
  }

  renderInitialDataRow(label: string, extractor: SimulationStateExtractor, value: number | undefined) {
    const { simulationState, simulationHistory } = this.props,
          cols = simulationHistory.map((yearState, index) => {
            return (<td key={index}>{extractor(yearState)}</td>);
          });
    cols.unshift(<th key="row-header" className="row-header" scope="row">{label}</th>);
    if (simulationHistory.length <= simulationState.simulationYear) {
      cols.push(<td key="current">{value}</td>);
    }
    return (<tr className="data-row">{cols}</tr>);
  }

  renderDataRow(label: string, extractor: SimulationStateExtractor, value: number | undefined) {
    const { simulationHistory } = this.props,
          finalYears = simulationHistory.filter(yearState => yearState.final != null),
          cols = finalYears.map((yearState, index) => {
            return (<td key={index}>{extractor(yearState)}</td>);
          });
    cols.unshift(<th key="row-header" className="row-header" scope="row">{label}</th>);
    cols.push(<td key="current">{value}</td>);
    return (<tr className="data-row">{cols}</tr>);
  }

  public render() {
    return (
      <div className="section stats">
        <h4>Statistics</h4>
        <table className="simulation-stats">
          <tbody>
            <tr className="column-header-row"><td/>{this.renderYearHeaders()}</tr>
            {this.renderInitialDataRow("Corn planted",
                                      state => state.initial.countCorn,
                                      this.state.initialCorn)}
            {this.renderDataRow("Corn remaining",
                                state => state.final && state.final.countCorn,
                                this.state.totalCorn)}
            {this.renderDataRow("First corn eaten",
                                state => undefined,
                                this.state.dayFirstCornEaten)}
            {this.renderInitialDataRow("Trap planted",
                                      state => state.initial.countTrap,
                                      this.state.initialTrap)}
            {this.renderDataRow("Trap remaining",
                                state => state.final && state.final.countTrap,
                                this.state.totalTrap)}
            {this.renderDataRow("Rootworms",
                                state => state.final && state.final.countWorm,
                                this.state.totalWorm)}
          </tbody>
        </table>
      </div>
    );
  }
}
export default SimulationStatistics;
