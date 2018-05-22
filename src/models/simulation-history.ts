import { ISimulationState } from '../corn-model';

export interface ISimulationYearState {
  initial: ISimulationState;
  final?: ISimulationState;
}

export type SimulationHistory = ISimulationYearState[];
