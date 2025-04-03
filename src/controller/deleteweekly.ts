import cron from "node-cron";
import { getDataSevenAgo } from "../db/contoller/getDataBefore";
import { deletePairData } from "../db/contoller/deletePairData";
import { cronjobs } from "./marketCapCron";

export const deleteDaily = () => {
  try {
    console.log("deleted daily");
    cron.schedule("0 0 * * *", async () => {
      const dataBeforeWeek = await getDataSevenAgo();
      if (!dataBeforeWeek || dataBeforeWeek.length === 0) {
        console.log("No data found to process");
        return;
      }
      for (let i = 0; i < dataBeforeWeek.length; i++) {
        deletePairData(dataBeforeWeek[i].pairAddress);
        for (let j = 0; j < cronjobs.length; j++) {
          if (cronjobs[j].pairAddress == dataBeforeWeek[i].pairAddress) {
            cronjobs[j].job.stop;
            console.log("cronjob is stopeed because of data");
          }
        }
      }
    });
  } catch (err) {
    console.log("Error deleting daily", err);
  }
};
