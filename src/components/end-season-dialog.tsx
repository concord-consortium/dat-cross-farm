import * as React from 'react';
import { ISimulationYearState } from '../models/simulation-history';
import '../style/dialog.css';

interface IProps {
  show: boolean;
  yearStats: ISimulationYearState;
  onToggleVisibility: () => void;
}

interface IState {
}

export default class EndSeasonDialog extends React.Component<IProps, IState> {

  public state: IState = {
  };

  toggleVisibility = () => {
    this.props.onToggleVisibility();
  }

  public render() {
    const displayClass = this.props.show ? "" : " hidden",
          { yearStats } = this.props,
          { initial, final } = { ...yearStats },
          { simulationYear, countCorn: initialCorn, countEggs: initialEggs } = { ...initial },
          finalCorn = final && final.countCorn || 0,
          finalEggs = final && final.countEggs || 0,
          invasionMsg = !initialEggs && finalEggs
                          ? <div>Oh no! There's been a rootworm invasion! Some of the corn has been eaten and some rootworm eggs have been laid in the soil.</div>
                          : null;
    return (
      <div className={'dialog-container' + displayClass} onClick={this.toggleVisibility}>
        <div className="dialog-text">
          <div style={{ fontWeight: 'bold' }}>Year {simulationYear + 1} Results</div>
          <div>Corn planted: {initialCorn || 0}, harvested: {finalCorn}</div>
          <div>Rootworm eggs initial: {initialEggs || 0}, final: {finalEggs}</div>
          {invasionMsg}
          <div>How much corn should Jonah plant for next year to maximize his corn crop?</div>
        </div>
      </div>
   );
  }
}
