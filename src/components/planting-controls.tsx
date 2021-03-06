import * as React from 'react';
import { Checkbox } from '@blueprintjs/core';
import '../style/planting-controls.css';
import '../style/toolbar-buttons.css';

export interface IPlayParams {
  cornPct: number;
  addPredators: boolean;
  wormStartYear: number;
  harvestmenStartYear: number;
  trapStartYear: number;
  trapPercentage: number;
}

interface IProps {
  year: number;
  isRunning: boolean;
  showSpidersOption: boolean;
  wormStartYear: number;
  harvestmenStartYear: number;
  trapStartYear: number;
  trapPercentage: number;
  cornPctPlanted: number;
  onTogglePlayPause: (params: IPlayParams) => void;
  onReset: () => void;
}
interface IState {
  cornPct: number;
  addPredators: boolean;
  wormStartYear: number;
  harvestmenStartYear: number;
  trapStartYear: number;
  trapPercentage: number;
}

export default class PlantingControls extends React.Component<IProps, IState> {

  state: IState = {
    // initial corn percentage only affected if barrier crop is introduced at the start of the simulation, otherwise it is altered later
    cornPct: this.props.trapStartYear === 0 ? 100 - this.props.trapPercentage : 100,
    addPredators: false,
    wormStartYear: this.props.wormStartYear,
    harvestmenStartYear: this.props.harvestmenStartYear,
    trapStartYear: this.props.trapStartYear,
    trapPercentage: this.props.trapStartYear === 0 ? this.props.trapPercentage : 0
  };

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.cornPctPlanted !== this.props.cornPctPlanted && this.state.cornPct !== this.props.cornPctPlanted) {
      this.updateCornPercentage(this.props.cornPctPlanted);
    }
  }

  handleCornPctChange = (evt: React.FormEvent<HTMLSelectElement>) => {
    this.updateCornPercentage(Number(evt.currentTarget.value));
  }

  handleAddPredatorsChange = () => {
    this.setState({ addPredators: !this.state.addPredators });
  }

  handlePlayPauseClick = () => {
    const { cornPct, addPredators, wormStartYear, harvestmenStartYear, trapStartYear, trapPercentage } = this.state,
          doAddPredators = this.props.showSpidersOption && addPredators && this.props.year >= harvestmenStartYear;
    this.props.onTogglePlayPause({ cornPct, addPredators: doAddPredators, wormStartYear, harvestmenStartYear, trapStartYear, trapPercentage });
  }

  handleResetClick = () => {
    this.props.onReset();
  }

  updateCornPercentage(newPercentage: number) {
    this.setState({ cornPct: newPercentage });
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
    const { year, showSpidersOption } =  this.props,
          { cornPct } = this.state,
          trapPct = 100 - cornPct;
    return (
      <div className="section planting-controls">
        <h4>Annual Planting Plan &mdash; Year {year}</h4>
        <div className="planting-option">
        <label>
          Corn:
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
        </div>
        <div className="planting-option">
          <span>Alfalfa:</span><span>{trapPct}%</span>
        </div>
        {showSpidersOption &&
          <div className="planting-option">
            <Checkbox
              checked={this.state.addPredators}
              label="Add harvestmen (rootworm predators)"
              onChange={this.handleAddPredatorsChange} />
          </div>
        }
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
