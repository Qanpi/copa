import mongoose from "mongoose"

//TODO: add keeping track of *current* tournament
const IncrementSchema = mongoose.Schema({
    model: {
        type: String,
        required: true,
        index: {unique: true}
    },
    idx: {
        type: Number,
        default: 0,
    }
})

IncrementSchema.statics.getNextId = async function(modelName, cb) {
    let inc = await this.findOne({model: modelName});

    if (!inc) inc = await new this({model: modelName}).save();
    inc.idx++; 
    inc.save();
    return inc.idx;
}

IncrementSchema.statics.PeekNextId = async function(modelName, cb) {
    let inc = await this.findOne({model: modelName});

    if (!inc) return 1;
    return inc.idx + 1;
}

export default mongoose.model("Increment", IncrementSchema);