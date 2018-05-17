import * as React from 'react';
import { addCornDense, addCornSparse, addTrapCropDense, addTrapCropSparse, plantMixedCrop, addWormsSparse }
  from '../corn-model';

interface IProps {
}
interface IState {
  cornPct: number;
}

export default class PlantingControls extends React.Component<IProps, IState> {

  state: IState = {
    cornPct: 50
  };

  plantCornDensely = () => {
    addCornDense();
  }

  plantCornSparsely = () => {
    addCornSparse();
  }

  plantTrapCropDensely = () => {
    addTrapCropDense();
  }

  plantTrapCropSparsely = () => {
    addTrapCropSparse();
  }

  addWorms = () => {
    addWormsSparse();
  }

  handleCornPctChange = (evt: React.FormEvent<HTMLSelectElement>) => {
    this.setState({ cornPct: Number(evt.currentTarget.value) });
  }

  plantCrop = () => {
    plantMixedCrop(this.state.cornPct);
  }

  render() {
    const trapPct = 100 - this.state.cornPct,
          plantButtonLabel = trapPct === 0
                              ? "Plant Corn Crop"
                              : (trapPct === 100 ? "Plant Trap Crop" : "Plant Mixed Crop");
    return (
      <div className="section planting-controls">
        <h4>Planting Controls</h4>
        <label>
          Corn:&nbsp;
          <select className="corn-percent-select"
                  value={this.state.cornPct}
                  onChange={this.handleCornPctChange}>
            <option value="0">0%</option>
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
          </select>
        </label>
        <br/>
        <br/>
        <div>Trap Crop: {trapPct}%</div>
        <br/>
        <div>
          <button id="plant-crop" onClick={this.plantCrop}>
            {plantButtonLabel}
          </button>
        </div>
        <br/>
        <div><button id="add-worms-sparse" onClick={this.addWorms}>
          Add Worms
        </button></div>
      </div>
    );
  }
}
