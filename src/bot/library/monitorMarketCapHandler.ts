import { startMarketCapMonitoring } from "../../utils/marketCapCron";

export const monitorMarketCapHandler = async () => {
  try {
    await startMarketCapMonitoring();
  } catch (error) {
    console.error("Error in monitorMarketCapHandler:", error);
  }
};
