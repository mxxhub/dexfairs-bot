import mongoose from "mongoose";
const Schema = mongoose.Schema;

const pairSchema = new Schema(
  {
    chainId: { type: String, required: true },
    pairAddress: { type: String, required: true },
    marketCap: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const Pair = mongoose.model("pairs", pairSchema);
