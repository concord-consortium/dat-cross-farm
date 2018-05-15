import * as React from 'react';
import { initCornModel } from '../corn-model';

interface IProps {}
interface IState {}

class PopulationsModel extends React.Component<IProps, IState> {

  modelDiv: HTMLDivElement | null;

  state: IState = {
  };

  public componentDidMount() {
    initCornModel(this.modelDiv, {});
  }

  public render() {
    return (
      <div id="environment" ref={(elt) => this.modelDiv = elt } />
    );
  }
}

export default PopulationsModel;
