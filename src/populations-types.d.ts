export interface ILocation {
    x: number;
    y: number;
}

export interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IAgent {
    label: string;
    bred: boolean;
    species: ISpecies;

    getLocation(): ILocation;
    setLocation(location: ILocation): void;

    hasProp(prop: string): boolean;
    get(prop:string): any;
    set(prop: string, value: any): void;

    getAllProperties(): any;

    getEnvironmentProperty(prop: string): any;
    setEnvironmentProperty(prop: string, value: any): void;

    getImages(opts: any): any;

    getSize(): number;

    isDead: boolean;
    die(): void;

    step(): void;

    makeNewBorn(): void;

    reproduce(mate: IAgent): void;
    createOffspring(mate: IAgent): IAgent;

    canShowInfo(): boolean;

    zIndex(): number;
}

export class IBarrier {
    constructor(x1: number, y1: number, width: number, height: number);
    contains(x: number, y: number): boolean;
    intersectsLine(lineFunc: any): boolean; // TODO
}

export type IRuleTestFunc = (agent: IAgent) => boolean;
export type IRuleActionFunc = (agent: IAgent) => void;

export class IRule {
    constructor(ruleDesc: { test: IRuleTestFunc, action: IRuleActionFunc });
    execute(agent: IAgent): void;
}

export class IEnvironment {

    cells: any[];
    agents: IAgent[];
    rules: IRule[];
    season: string;
    date: number;

    constructor(opts: any);

    addAgent(agent: IAgent): boolean;
    removeAgent(agent: IAgent): void;
    removeDeadAgents(): void;

    agentsWithin(rect: IRect): IAgent[];

    ensureValidLocation(location: ILocation): void;
    randomLocation(): ILocation;
    randomLocationWithin(left: number, top: number, width: number, height: number, avoidBarriers?: boolean): ILocation;

    get(col: number, row: number, prop: string): any;
    set(col: number, row: number, prop: string, value: any): void;
    getAt(x: number, y: number, prop: string): any;
    setAt(x: number, y: number, prop: string, value: any): void;

    getAgentsAt(x: number, y: number): IAgent[];
    getAgentAt(x: number, y: number): IAgent;
    getAgentsCloseTo(x: number, y: number, maxDistance?: number, speciesName?: string): IAgent[];
    getAgentCloseTo(x: number, y: number, maxDistance?: number, speciesName?: string): IAgent;
    
    setBarriers(bars: any): void;    // TODO
    addBarrier(x: number, y: number, width: number, height: number): void;
    crossesBarrier(start: number, finish: number): boolean;
    isInBarrier(x: number, y: number): boolean;

    setSeasonLength(season: string, length: number): void;

    pickUpAgent(agent: IAgent): void;
    dropCarriedAgent(): void;

    setDefaultAgentCreator(defaultSpecies: any, defaultTraits: any, agentAdderCallback: any): void; // TODO
    addDefaultAgent(x: number, y: number): void;

    /*** Run Loop ***/

    setSpeed(speed: number): void;
    start(): void;
    stop(): void;
    step(): void;
    reset(): void;

    /*** Getters and Setters ***/
    
    getView(): any; // TODO

    addRule(rule: IRule): void;
    removeRule(rule: IRule): void;
    clearRules(): void;

    setBackground(path: any): void; // TODO
}

export class ITrait {
    constructor(traitDesc: {
        name: string,
        possibleValues?: any,
        min?: number,
        max?: number,
        default: any,
        float?: boolean,
        mutatable?: boolean
    });

    getDefaultValue(): any;
    getRandomValue(): any;
    mutate(value: any): any;
    isPossibleValue(value: any): boolean;
}

export class ISpecies {
    speciesName: string;
    individualName: string;
    agentClass: any;
    traits: ITrait[];
    viewLayer: any;
    imageProperties: any;
    defs: { [index: string]: any };
    reproductiveStrategy: any;
    mutationChance: number;

    constructor(speciesDesc: {
        speciesName: string,
        individualName: string,
        agentClass: any,
        traits: ITrait[],
        viewLayer: any,
        imageProperties: any,
        defs: { [index: string]: any },
        reproductiveStrategy: any,
        mutationChance: number
    });

    createAgent(extraTraits?: ITrait[]): IAgent;

    getImages(): any[];

    getTrait(traitName: string): ITrait | null;
    addTrait(trait: ITrait): void;
    setMutatable(traitName: string, mutatable: boolean): void;
}

export class IInteractive {
    constructor(options: any);

    getEnvironmentPane(): any;

    showPlayButton(): void;
    showResetButton(): void;

    repaint(): void;
    play(): void;
    stop(): void;
    reset(): void;
}
