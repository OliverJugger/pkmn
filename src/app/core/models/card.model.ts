export interface CardImages {
  small: string;
  large: string;
}

export interface SetImages {
  symbol: string;
  logo: string;
}

export interface Legalities {
  unlimited?: string;
  standard?: string;
  expanded?: string;
}

export interface CardSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: Legalities;
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: SetImages;
}

export interface Ability {
  name: string;
  text: string;
  type: string;
}

export interface Attack {
  name: string;
  cost: string[];
  convertedEnergyCost: number;
  damage: string;
  text: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface Resistance {
  type: string;
  value: string;
}

export interface TcgPlayerPrice {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
}

export interface TcgPlayer {
  url: string;
  updatedAt: string;
  prices?: {
    holofoil?: TcgPlayerPrice;
    reverseHolofoil?: TcgPlayerPrice;
    normal?: TcgPlayerPrice;
    '1stEditionHolofoil'?: TcgPlayerPrice;
    '1stEditionNormal'?: TcgPlayerPrice;
  };
}

export interface CardmarketPrice {
  averageSellPrice?: number;
  lowPrice?: number;
  trendPrice?: number;
  reverseHoloTrend?: number;
}

export interface Cardmarket {
  url: string;
  updatedAt: string;
  prices?: CardmarketPrice;
}

export interface Card {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  abilities?: Ability[];
  attacks?: Attack[];
  weaknesses?: Weakness[];
  resistances?: Resistance[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: CardSet;
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: Legalities;
  regulationMark?: string;
  images: CardImages;
  tcgplayer?: TcgPlayer;
  cardmarket?: Cardmarket;
}
