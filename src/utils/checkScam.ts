import { Token } from "../@types/global";

export const checkScam = (token: Token) => {
  console.log("token of checking: ", token);
  return (
    token?.is_honeypot === "1" ||
    token?.is_mintable === "1" ||
    token?.can_take_back_ownership === "1" ||
    token?.hidden_owner === "1" ||
    token?.slippage_modifiable === "1" ||
    parseFloat(token?.buy_tax) >= 10 ||
    parseFloat(token?.sell_tax) >= 10 ||
    token?.is_blacklisted === "1" ||
    token?.cannot_sell_all === "1" ||
    token?.transfer_pausable === "1"
  );
};
