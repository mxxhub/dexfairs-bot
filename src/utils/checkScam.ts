import { Token } from "../@types/global";

export const checkScam = (data: Token) => {
  try {
    return (
      data.honeypotResult.isHoneypot === true ||
      data.simulationResult.buyTax > 10 ||
      data.simulationResult.sellTax > 10 ||
      data.pair.liquidity < 1
    );
  } catch (err) {
    console.log("Checking scam error: ", err);
  }
};
