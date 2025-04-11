export interface IPair {
  chainId: string;
  pairAddress: string;
  marketCap: number;
  createdAt: Date;
  flag: boolean;
}

export interface Token {
  is_honeypot: string;
  is_mintable: string;
  can_take_back_ownership: string;
  hidden_owner: string;
  slippage_modifiable: string;
  buy_tax: string;
  sell_tax: string;
  is_blacklisted: string;
  cannot_sell_all: string;
  transfer_pausable: string;
}
