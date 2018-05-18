import * as React from 'react';
import ConfigurableTrait from './configurable-trait';
import { Species } from '../populations';
import { worm } from '../species/rootworm';
import '../style/App.css';

interface ITraitSpec {
  species: Species;
  traitName: string;
}
const traitMap: { [key: string]: ITraitSpec } = {
  'trait-worm-eating-distance': {
    species: worm,
    traitName: 'eating distance',
  },
  'trait-worm-energy': {
    species: worm,
    traitName: 'energy',
  },
  'trait-worm-metabolism': {
    species: worm,
    traitName: 'metabolism',
  },
  'trait-worm-resource-consumption-rate': {
    species: worm,
    traitName: 'resource consumption rate',
  },
  'trait-worm-speed': {
    species: worm,
    traitName: 'default speed',
  },
  'trait-worm-larva-speed': {
    species: worm,
    traitName: 'larva max speed',
  },
  'trait-worm-vision-distance': {
    species: worm,
    traitName: 'vision distance adult',
  },
  'trait-worm-larva-vision-distance': {
    species: worm,
    traitName: 'vision distance',
  },
  'trait-worm-max-offspring': {
    species: worm,
    traitName: 'max offspring',
  },
  'trait-worm-egg-energy': {
    species: worm,
    traitName: 'egg lay energy threshold'
  }
};

interface IProps {
}

interface IState {}

export default class WormTraitPanel extends React.Component<IProps, IState> {

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
      <div className="section sim-adjustment">
        <h4>Worms</h4>
        {renderConfigTrait(
          "Sensing Distance (larva):",
          "Controls the distance that the larval form of the worm can sense nearby food (crops)",
          "trait-worm-larva-vision-distance")}
        {renderConfigTrait(
          "Sensing Distance (adult):",
          "Controls the distance that the adult form of the worm can sense nearby food (crops)",
          "trait-worm-vision-distance")}
        {renderConfigTrait(
          "Metabolism:",
          "Rate at which energy is depleted during normal activity",
          "trait-worm-metabolism")}
        {renderConfigTrait(
          "Energy:",
          "Initial energy for new worms. Mature worms only lay eggs when they have sufficient energy. When energy is depleted, the worm dies.",
          "trait-worm-energy")}
        {renderConfigTrait(
          "Eating Distance:",
          "How close the worm must be to food to eat it",
          "trait-worm-eating-distance")}
        {renderConfigTrait(
          "Consumption Rate:",
          "Rate at which resources are depleted from the food source (and transfered to worm energy) when eating",
          "trait-worm-resource-consumption-rate")}
        {renderConfigTrait(
          "Worm speed:",
          "Maximum speed of the adult rootworm beetle",
          "trait-worm-speed")}
        {renderConfigTrait(
          "Worm larva speed:",
          "Maximum speed of the rootworm larvae",
          "trait-worm-larva-speed")}
        {renderConfigTrait(
          "Worm max offspring:",
          "Maximum number of eggs laid during mature life stage - eggs are only laid if there is sufficient energy.",
          "trait-worm-max-offspring")}
        {renderConfigTrait(
          "Egg laying energy required:",
          "Energy required for a mature worm to lay an egg. Higher values ensure only a well-fed worm will lay an egg.",
          "trait-worm-egg-energy")}
      </div>
    );
  }
}
