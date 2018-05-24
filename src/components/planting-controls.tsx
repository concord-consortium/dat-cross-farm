import * as React from 'react';
import { Checkbox } from '@blueprintjs/core';
import '../style/planting-controls.css';
import '../style/toolbar-buttons.css';

export interface IPlayParams {
  cornPct: number;
  addPredators: boolean;
}

interface IProps {
  year: number;
  isRunning: boolean;
  showSpidersOption: boolean;
  onTogglePlayPause: (params: IPlayParams) => void;
  onReset: () => void;
}
interface IState {
  cornPct: number;
  addPredators: boolean;
}

export default class PlantingControls extends React.Component<IProps, IState> {

  state: IState = {
    cornPct: 100,
    addPredators: false
  };

  handleCornPctChange = (evt: React.FormEvent<HTMLSelectElement>) => {
    this.setState({ cornPct: Number(evt.currentTarget.value) });
  }

  handleAddPredatorsChange = () => {
    this.setState({ addPredators: !this.state.addPredators });
  }

  handlePlayPauseClick = () => {
    const { cornPct, addPredators } = this.state,
          doAddPredators = this.props.showSpidersOption && addPredators;
    this.props.onTogglePlayPause({ cornPct, addPredators: doAddPredators });
  }

  handleResetClick = () => {
    this.props.onReset();
  }

  renderSpidersOption() {
    const { showSpidersOption } = this.props;
    return(
      showSpidersOption
        ? <Checkbox
            checked={this.state.addPredators}
            label="Add harvestmen (rootworm predators)"
            onChange={this.handleAddPredatorsChange} />

        : null
    );
  }

  render() {
    const { year } =  this.props,
          { cornPct } = this.state,
          trapPct = 100 - cornPct;
    return (
      <div className="section planting-controls">
        <h4>Annual Planting Plan &mdash; Year {year}</h4>
        <br/>
        <label>
          Corn:&nbsp;&nbsp;
          <select className="corn-percent-select"
                  value={cornPct}
                  onChange={this.handleCornPctChange}>
            <option value="0">0%</option>
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span>Alfalfa:&nbsp;&nbsp;{trapPct}%</span>
        <br/>
        {this.props.showSpidersOption ? <br/> : null}
        {this.renderSpidersOption()}
        <div className='toolbar'>
          <div className='toolbar-button' onClick={this.handlePlayPauseClick}>
            <div className={this.props.isRunning ? 'pause-icon-button' : 'play-icon-button'} />
          </div>
          <div className='toolbar-button' onClick={this.handleResetClick}>
            <div className='reset-icon-button' />
          </div>
        </div>
      </div>
    );
  }
}
