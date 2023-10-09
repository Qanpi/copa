import mongoose, { SchemaTypes } from "mongoose";

const MetadataSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
      index: { unique: true },
    },
    idx: {
      type: Number,
      default: 0,
    },
    latest: {
      type: SchemaTypes.ObjectId, //TODO: populate option
    },
  },
);

export default mongoose.model("Metadata", MetadataSchema);
