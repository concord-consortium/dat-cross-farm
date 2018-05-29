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
          { simulationYear, countCorn: initialCorn,
            countEggs: initialEggs, countSpiders: initialSpiders } = { ...initial },
          finalCorn = final ? final.countCorn : null,
          finalEggs = final ? final.countEggs : null,
          cornPlanted = <span className='dialog-text-bold'>{initialCorn || 0}</span>,
          cornHarvested = <span className='dialog-text-bold'>{finalCorn || 0}</span>,
          cornYield = initialCorn
                        ? `${Math.round(100 * (finalCorn || 0) / initialCorn)}%`
                        : null,
          cornYieldSpan = <span className='dialog-text-bold'>{cornYield || 0}</span>,
          initialEggsSpan = <span className='dialog-text-bold'>{initialEggs || 0}</span>,
          finalEggsSpan = <span className='dialog-text-bold'>{finalEggs || 0}</span>,
          spidersAppliedText = initialSpiders > 0 ? "yes" : "no",
          spidersAppliedSpan = <span className='dialog-text-bold'>{spidersAppliedText}</span>,
          invasionMsg = !initialEggs && finalEggs
                          ? <div>Oh no! There's been a rootworm invasion! Some of the corn has been eaten and rootworm eggs have been laid in the soil.</div>
                          : null,
          spiderQuestion = finalEggs
                            ? <div>Should he apply Harvestman spiders to his crop?</div>
                            : null;
    return (
      <div className={'dialog-container' + displayClass} onClick={this.toggleVisibility}>
        <div className="end-season-dialog dialog-text">
          <div style={{ fontWeight: 'bold' }}>Year {simulationYear + 1} Results</div>
          <div>Corn planted: {cornPlanted}, harvested: {cornHarvested}, yield: {cornYieldSpan}</div>
          <div>Rootworm eggs initial: {initialEggsSpan}, final: {finalEggsSpan}</div>
          <div>Harvestment applied: {spidersAppliedSpan}</div>
          {invasionMsg}
          <div>How much corn should Jonah plant for next year to maximize his corn crop?</div>
          {spiderQuestion}
        </div>
      </div>
   );
  }
}
