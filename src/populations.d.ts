declare namespace Populations {
  export interface Location {
    x: number;
    y: number;
  }
  
  export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  export class Events {
    static dispatchEvent(type: string, data: any): void;
    static addEventListener(type: string, listener: (evt: any) => void): void;
  }
  
  export class Agent {
    label: string;
    bred: boolean;
    species: Species;
  
    getLocation(): Location;
    setLocation(location: Location): void;
  
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
  
    reproduce(mate: Agent): void;
    createOffspring(mate: Agent): Agent;
  
    canShowInfo(): boolean;
  
    zIndex(): number;
  }

  export interface AgentDistance {
    agent: Agent;
    distanceSq: number;
  }

  export class AnimatedAgent {
    currentMovement: string;

    static MOVEMENTS: {
      STOPPED: string,
      MOVESTEP: string
    }

    setMovement(movement: string): void;
    getMovement(): string;
  }

  export class BasicAnimal extends Agent {
    _viewLayer: number;
    _hasEatenOnce: boolean;
    _timeLastMated: number;

    static BEHAVIOR: {
      EATING: string,
      MATING: string,
      FLEEING: string,
      HIDING: string,
      WANDERING: string
    };

    constructor(args: any);

    makeNewBorn(): void;

    step(): void;

    eat(): void;
    flee(): void;
    mate(): void;
    wander(speed: number): void;
    chase(agentDistance: AgentDistance): void;
    runFrom(agentDistance: AgentDistance): void;
    move(speed: number): void;

    _direction(from: Location, to: Location): number;
    _eatPrey(agent: Agent): void;
    _setSpeedAppropriateForAge(): void;
    _depleteEnergy(): void;
    _hunger(): number;
    _fear(): number;
    _desireToMate(): number;
    _determineBehavior(): string;

    _nearestPredator(): AgentDistance | null;
    _nearestPrey(): AgentDistance | null;
    _nearestHidingPlace(): AgentDistance | null;
    _nearestMate(): AgentDistance | null;
    _nearestMatingMate(): AgentDistance | null;

    _nearestAgents(): AgentDistance[];
    _nearestAgentsMatching(options: any): AgentDistance[];

    _distanceSquared(p1: Location, p2: Location): number;

    _getSurvivalChances(): number;
  }
  
  export class BasicPlant extends Agent {
    _hasSeeded: boolean;

    constructor(args: any);

    getSize(): number;

    makeNewBorn(): void;

    createSeeds(): void;

    step(): void;
  }

  export class FastPlant extends Agent {
    _hasSeeded: boolean;

    constructor(args: any);

    getSize(): number;

    makeNewBorn(): void;

    step(): void;

    _checkSurvival(): void;
  }

  export class Environment {
    cells: any[];
    agents: Agent[];
    rules: Rule[];
    season: string;
    date: number;
  
    static EVENTS: {
      START: string,
      STOP: string,
      STEP: string,
      RESET: string,
      AGENT_ADDED: string,
      AGENT_EATEN: string,
      SEASON_CHANGED: string,
      USER_REMOVED_AGENTS: string
    };
  
    constructor(opts: any);
  
    addAgent(agent: Agent): boolean;
    removeAgent(agent: Agent): void;
    removeDeadAgents(): void;
  
    agentsWithin(rect: Rect): Agent[];
  
    ensureValidLocation(location: Location): void;
    randomLocation(): Location;
    randomLocationWithin(left: number, top: number, width: number, height: number, avoidBarriers?: boolean): Location;
  
    get(col: number, row: number, prop: string): any;
    set(col: number, row: number, prop: string, value: any): void;
    getAt(x: number, y: number, prop: string): any;
    setAt(x: number, y: number, prop: string, value: any): void;
  
    getAgentsAt(x: number, y: number): Agent[];
    getAgentAt(x: number, y: number): Agent;
    getAgentsCloseTo(x: number, y: number, maxDistance?: number, speciesName?: string): Agent[];
    getAgentCloseTo(x: number, y: number, maxDistance?: number, speciesName?: string): Agent;
    
    setBarriers(bars: any): void;    // TODO
    addBarrier(x: number, y: number, width: number, height: number): void;
    crossesBarrier(start: number, finish: number): boolean;
    isInBarrier(x: number, y: number): boolean;
  
    setSeasonLength(season: string, length: number): void;
  
    pickUpAgent(agent: Agent): void;
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
  
    addRule(rule: Rule): void;
    removeRule(rule: Rule): void;
    clearRules(): void;
  
    setBackground(path: any): void; // TODO
  }
  
  export type RuleTestFunc = (agent: Agent) => boolean;
  export type RuleActionFunc = (agent: Agent) => void;

  export class Rule {
    constructor(ruleDesc: { test?: RuleTestFunc, action: RuleActionFunc });
    execute(agent: Agent): void;
  }
  
  export class Species {
    speciesName: string;
    individualName: string;
    agentClass: any;
    traits: Trait[];
    viewLayer: any;
    imageProperties: any;
    defs: { [index: string]: any };
    reproductiveStrategy: any;
    mutationChance: number;
  
    constructor(speciesDesc: {
        speciesName: string,
        individualName?: string,
        agentClass: any,
        traits: Trait[],
        viewLayer?: any,
        imageProperties?: any,
        imageRules: any,
        defs: { [index: string]: any },
        reproductiveStrategy?: any,
        mutationChance?: number
    });
  
    createAgent(extraTraits?: Trait[]): Agent;
  
    getImages(): any[];
  
    getTrait(traitName: string): Trait | null;
    addTrait(trait: Trait): void;
    setMutatable(traitName: string, mutatable: boolean): void;
  }
  
  export class Trait {
    constructor(traitDesc: {
        name: string,
        possibleValues?: any,
        min?: number,
        max?: number,
        default?: any,
        float?: boolean,
        mutatable?: boolean
    });
  
    getDefaultValue(): any;
    getRandomValue(): any;
    mutate(value: any): any;
    isPossibleValue(value: any): boolean;

    _mutateValueFromRange(value: any): any;
  }
  
  export class Interactive {
    constructor(options: any);
  
    getEnvironmentPane(): any;
  
    showPlayButton(): void;
    showResetButton(): void;
  
    repaint(): void;
    play(): void;
    stop(): void;
    reset(): void;
  }
}

export = Populations;
