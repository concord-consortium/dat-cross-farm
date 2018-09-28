# DAT-Cross Farm Model

DAT-Cross: **D**eveloping **A**ssessments and **T**ools to Support the Teaching and Learning of Science **Cross**cutting Concepts

Developed by the [Concord Consortium](https://concord.org) in collaboration with Indiana University (IU) and the Educational Testing Service (ETS).

The farm model is an agent-based model that uses the [Populations.js](https://github.com/concord-consortium/populations.js) library developed by the [Concord Consortium](https://concord.org).

The model is available at [https://dat-cross.concord.org](https://dat-cross.concord.org).

## Back Story for the Model

Farmer Jonah’s primary cash crop is corn, and he has been able to maximize his corn crop for several years planting his field down to corn.

One year, Jonah’s field is invaded by an infestation of corn rootworm. Adult corn rootworm insects fly into the field and eat the silk of the growing corn preventing them from developing properly. Then they lay eggs in the soil that remain there through the winter. In the spring, the eggs hatch and the larval insects feast on the tender roots of the sprouting corn. As the corn grows, they burrow into the corn roots, depriving it of water and nutrients. This weakens the corn, and the stalks tend to bend over and the ears of corn develop poorly. Later in the summer, the adult insects emerge and start the cycle again. Corn rootworm has the potential to take a devastating toll on Jonah’s corn crop.

Jonah needs an ecologically sound approach for protecting his corn. Two approaches are available to him:
- He can plant a “trap crop” among his corn. A trap crop is a plant that is more attractive to the rootworm than corn, but has less nutritional value. If rootworms find the trap crop they prefer to eat it, but because of its lower nutritional value, it doesn't provide as much sustenance as eating corn.
- After an infestation he can apply a rootworm predator to his field. One predator of the rootworm is the harvestman spider.

Can you help Jonah maximize his corn crop?

## Running the Model

#### Default/student mode: [https://dat-cross.concord.org](https://dat-cross.concord.org)

#### Configuration mode: [https://dat-cross.concord.org/?config](https://dat-cross.concord.org/?config)

Configuration mode exposes the underlying model parameters. This makes it possible to run the model with different parameters for the corn, alfalfa, rootworms, or harvestmen. The UI for configuring the parameters replaces the bar charts of the results. There is currently no way to run the model with alternative parameter settings outside of configuration mode, but that could certainly be added at some point.

#### Quiet mode: [https://dat-cross.concord.org/?quiet](https://dat-cross.concord.org/?quiet)

In quiet mode, the introductory and end-of-season dialogs are not presented.

### Three simulation scenarios over 5 years:
- Jonah plants 100% of the field as corn, and is affected by rootworms starting in the second year.
[https://dat-cross.concord.org/?quiet&runYears=5&wormStartYear=2](https://dat-cross.concord.org/?quiet&runYears=5&wormStartYear=2)
- Jonah introduces a predator to the rootworms, the harvestman spider, in the third year
[https://dat-cross.concord.org/?quiet&runYears=5&wormStartYear=2&harvestmenStartYear=3](https://dat-cross.concord.org/?quiet&runYears=5&wormStartYear=2&harvestmenStartYear=3)
- Jonah plants a mix of 75% corn, 25% Alfalfa in the third year
[https://dat-cross.concord.org/?quiet&runYears=5&wormStartYear=2&trapStartYear=4&&trapPercentage=25](https://dat-cross.concord.org/?quiet&runYears=5&wormStartYear=2&trapStartYear=4&trapPercentage=25)
- Jonah uses both harvestmen and a mix of Alfalfa starting in the third year
[https://dat-cross.concord.org/?quiet&runYears=5&wormStartYear=2&harvestmenStartYear=3&trapStartYear=4&&trapPercentage=25](https://dat-cross.concord.org/?quiet&runYears=5&wormStartYear=2&harvestmenStartYear=3&trapStartYear=4&&trapPercentage=25)

### Simulation Parameter List:
- `quiet`: Run without the on-screen prompts
- `config`: Expose the full simulation parameters
- `runYears`: Simulation will run for n consecutive years before pausing - used for running a multi-year scenario, for example `runYears=5`. Default value, if not present, is 1 year.
- `wormStartYear`: The year in which the rootworm beetles will start to appear. Default value is 1 (the first year).
- `harvestmenStartYear`: The year in which harvestman spiders will be added. Default value is 99 (no harvestmen).
- `trapStartYear`: The year in which a trap crop is mixed in to the planting. Default value is 99 (no trap crop).
- `trapPercentage`: The percentage of trap crop to corn (use either 25, 50, or 75). Default value is 0 (no trap crop).


#### Configuration mode and quiet mode: [https://dat-cross.concord.org/?config&quiet](https://dat-cross.concord.org/?config&quiet)

# Development

This project was developed using [CreateReactApp-TypeScript](https://github.com/wmonk/create-react-app-typescript), which is a fork of [CreateReactApp](https://github.com/facebookincubator/create-react-app) modified to support TypeScript. As of this writing the project has not ejected so it can still be updated to newer versions of [CreateReactApp-TypeScript](https://github.com/wmonk/create-react-app-typescript). The standard README for CreateReactApp, which provides tremendous detail on the infrastructure provided and the configuration options available, is provided below.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](#running-tests) for more information.

### `npm test:ci`

Runs the unit tests non-interactively (ci = continuous integration).

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](#deployment) for more information.

### `npm run lint`

Runs lint on the project sources.

### `npm run lint:fix`

Runs lint on the project sources with the `--fix` option, which automatically corrects problems (like missing semicolons) that can be fixed programmatically. Any modified source files will need to be committed manually.

## `Populations.js` Wrapper

The [Populations.js](https://github.com/concord-consortium/populations.js) library was developed in [CoffeeScript](https://coffeescript.org/) and bundled with [brunch](http://brunch.io/). Historically, models built using Populations.js were often developed with CoffeeScript and brunch as well, often as part of the [Populations Models](https://github.com/concord-consortium/populations-models) project. For this project we developed a wrapper for the Populations.js library that allows it to be used from a TypeScript application bundled with WebPack. TypeScript definitions at [populations.d.ts](src/populations.d.ts) provide a typed interface to the capabilities of the Populations.js library.

A pre-built version of the Populations.js library is included in the `public` folder with the name `vendor.js`. A local JavaScript file [populations.js](src/populations.js) imports the required symbols from `vendor.js` using the `require_brunch` function and then exports them for consumption by the rest of the application. For this to work, the symbol `require_brunch` is configured as an alias for `require` at runtime in `index.html`. (`require_brunch` is used to prevent WebPack from processing it like regular `require`s). For unit testing, a hacked version of the Populations.js library is available in the `test` folder as `vendor-test.js` in which unused libraries were manually removed (to improve load times) and the `require_brunch` symbol is explicitly defined as an alias for require. The `vendor-test.js` library is then loaded into JSDom in [setupTests.ts](src/setupTests.ts).

Updating to a different version of the Populations.js library would require replacing `vendor.js` with the new version, and then producing a hacked version of the new version to replace `vendor-test.js`. Ultimately, once the Populations.js library is updated to support WebPack builds directly, these workarounds should be eliminated.

## Asset Attributions

[Spider Image](https://openclipart.org/detail/73135/spider) from [openclipart](https://openclipart.org/) ([Creative Commons Zero 1.0 Public Domain License](http://creativecommons.org/publicdomain/zero/1.0/)).

[Copy Icon](https://www.flaticon.com/free-icon/copy_832334#term=copy&page=1&position=77) by [SmashIcons](https://www.flaticon.com/authors/smashicons) from [FlatIcon](https://www.flaticon.com/) ([Creative Commons BY 3.0](http://creativecommons.org/licenses/by/3.0/) license).


# create-react-app README

The default README provided by CreateReactApp is available at [README-CreateReactApp.md](README-CreateReactApp.md). It contains additional information about the infrastructure of the project and the configuration options available.
