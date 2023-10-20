import mongoose, { InferSchemaType, SchemaTypes } from "mongoose";

const MetadataSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
      index: { unique: true },
    },
    idx: {
      type: Number,
      default: 1,
    },
    latest: {
      type: SchemaTypes.ObjectId, //TODO: populate option
    },
  },
);

export type TMetadata = InferSchemaType<typeof MetadataSchema>;

export default mongoose.model<TMetadata>("Metadata", MetadataSchema);
