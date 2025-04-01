import mongoose from "mongoose";
const Schema = mongoose.Schema;

const pairSchema = new Schema(
  {
    chainId: { type: String, default: "ethereum" },
    pairAddress: { type: String, default: "" },
    marketCap: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Pair = mongoose.model("pairs", pairSchema);
