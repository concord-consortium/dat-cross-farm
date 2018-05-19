import * as React from 'react';
import ConfigurableTrait from './configurable-trait';
import { Species } from '../populations';
import { corn } from '../species/corn';
import { variedPlants } from '../species/varied-plants';

interface ITraitSpec {
  species: Species;
  traitName: string;
}
const traitMap: { [key: string]: ITraitSpec } = {
  'trait-corn-health': {
    species: corn,
    traitName: 'health',
  },
  'trait-corn-worm-preference': {
    species: corn,
    traitName: 'worm preference',
  },
  'trait-corn-worm-nutrition': {
    species: corn,
    traitName: 'worm nutrition',
  },
  'trait-trap-health': {
    species: variedPlants,
    traitName: 'health',
  },
  'trait-trap-worm-preference': {
    species: variedPlants,
    traitName: 'worm preference',
  },
  'trait-trap-worm-nutrition': {
    species: variedPlants,
    traitName: 'worm nutrition',
  }
};

interface IProps {
}

interface IState {}

export default class CropTraitPanel extends React.Component<IProps, IState> {

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
      <div className="crop-trait-panel">
        {renderConfigTrait(
          "Corn health:",
          "Health is reduced when the plant is eaten. If reduced to 0 the plant dies.",
          "trait-corn-health")}
        {renderConfigTrait(
          "Rootworm corn preference:",
          "Attractiveness of corn to rootworms",
          "trait-corn-worm-preference")}
        {renderConfigTrait(
          "Rootworm corn nutrition:",
          "Nutritional value of corn to rootworms (1 = 100%)",
          "trait-corn-worm-nutrition")}
        <br/>
        {renderConfigTrait(
          "Alfalfa health:",
          "Health is reduced when the plant is eaten. If reduced to 0 the plant dies.",
          "trait-trap-health")}
        {renderConfigTrait(
          "Rootworm alfalfa preference:",
          "Attractiveness of alfalfa to rootworms",
          "trait-trap-worm-preference")}
        {renderConfigTrait(
          "Rootworm alfalfa nutrition:",
          "Nutritional value of alfalfa to rootworms (1 = 100%)",
          "trait-trap-worm-nutrition")}
      </div>
    );
  }
}
