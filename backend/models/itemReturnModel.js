const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemReturnSchema = new Schema({
    item_return_id: {
        type: String,
        required: true
    },
    item_reservation_id: {
        type: String,
        required: true
    },
    item_return_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("itemReturnModel", ItemReturnSchema);
