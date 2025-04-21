export interface IPair {
  chainId: string;
  pairAddress: string;
  marketCap: number;
  createdAt: Date;
  flag: boolean;
}

export interface Token {
  honeypotResult: {
    isHoneypot: boolean;
  };
  simulationResult: {
    buyTax: number;
    sellTax: number;
  };
  pair: {
    liquidity: number;
  };
  // contractCode: {
  //   openSource: boolean;
  // };
}
