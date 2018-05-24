import * as React from 'react';
import ConfigurableTrait from './configurable-trait';
import { Species } from '../populations';
import { spider } from '../species/spider';

interface ITraitSpec {
  species: Species;
  traitName: string;
}
const traitMap: { [key: string]: ITraitSpec } = {
  'trait-default-speed': {
    species: spider,
    traitName: 'default speed',
  },
  'trait-speed': {
    species: spider,
    traitName: 'speed',
  },
  'trait-vision-distance': {
    species: spider,
    traitName: 'vision distance',
  },
  'trait-eating-distance': {
    species: spider,
    traitName: 'eating distance',
  },
  'trait-resource-consumption-rate': {
    species: spider,
    traitName: 'resource consumption rate',
  },
  'trait-metabolism': {
    species: spider,
    traitName: 'metabolism',
  }
};

interface IProps {
}

interface IState {}

export default class SpiderTraitPanel extends React.Component<IProps, IState> {

  state: IState = {
  };

  getDefaultTraitValue = (id: string) => {
    const spec = traitMap[id],
          trait = spec && spec.species.getTrait(spec.traitName),
          defaultValue = trait && trait.getDefaultValue();
    return defaultValue != null ? String(defaultValue) : "";
  }

  setDefaultTraitValue = (id: string, value: number) => {
    const traitSpec = traitMap[id],
          traitSpecies = traitSpec && traitSpec.species,
          traitName = traitSpec && traitSpec.traitName,
          trait = traitSpecies && traitSpecies.getTrait(traitName);
    if (trait) {
      trait.default = value;
    }
  }

  render() {

    const renderConfigTrait = (label: string, helpText: string, inputID: string) => {
      // inputID should correspond to entry in trait map
      if (!traitMap[inputID]) {
        console.error(`Invalid trait ID: '${inputID}'`);
      }
      return (
        <ConfigurableTrait
          label={label}
          helpText={helpText}
          inputID={inputID}
          initialValue={this.getDefaultTraitValue(inputID)}
          onBlur={this.setDefaultTraitValue}
        />
      );
    };

    return (
      <div className="spider-trait-panel">
        {renderConfigTrait(
          "Default speed:",
          "Controls the default speed of the spider",
          "trait-default-speed")}
        {renderConfigTrait(
          "Speed:",
          "Controls the speed of the spider",
          "trait-speed")}
        {renderConfigTrait(
          "Vision distance:",
          "How close the spider must be to food to see it",
          "trait-vision-distance")}
        {renderConfigTrait(
          "Eating distance:",
          "How close the spider must be to food to eat it",
          "trait-eating-distance")}
        {renderConfigTrait(
          "Consumption Rate:",
          "Rate at which resources are depleted from the food source (and transfered to spider energy) when eating",
          "trait-resource-consumption-rate")}
        {renderConfigTrait(
          "Metabolism:",
          "Rate at which energy is depleted during normal activity",
          "trait-metabolism")}
      </div>
    );
  }
}
