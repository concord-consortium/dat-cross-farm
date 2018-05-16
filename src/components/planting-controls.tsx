import * as React from 'react';
import { addCornDense, addCornSparse, addTrapCropDense, addTrapCropSparse, addWormsSparse }
  from '../corn-model';

interface IProps {
}
interface IState {}

export default class PlantingControls extends React.Component<IProps, IState> {

  state: IState = {
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

  render() {
    return (
      <div className="section planting-controls">
        <h4>Planting Controls</h4>
        <div><button id="add-corn-dense" onClick={this.plantCornDensely}>
          Plant Corn Densely
        </button></div>
        <div><button id="add-corn-sparse" onClick={this.plantCornSparsely}>
          Plant Corn Sparsely
        </button></div>
        <div><button id="add-trap-dense" onClick={this.plantTrapCropDensely}>
          Plant Trap Crop Densely
        </button></div>
        <div><button id="add-trap-sparse" onClick={this.plantTrapCropSparsely}>
          Plant Trap Crop Sparsely
        </button></div>
        <div><button id="add-worms-sparse" onClick={this.addWorms}>
          Add Worms
        </button></div>
      </div>
    );
  }
}
