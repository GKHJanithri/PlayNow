const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const  ItemReservationSchema = new Schema({
   // item_reservation_id removed, use _id
    student_id : {
        type : String,
        required : true},
    item_id : {
        type : Number,
        required : true},   
    item_quantity_reserved : {
        type : Number,
        required : true},
    item_reservation_date: {
        type : Date,
        default : Date.now},
    item_reservation_status: {
        type : String,
        required : true},
        item_reservation_return_date: {
            type : Date,
            default : Date.now
        },
        item_reservation_purpose: {
            type: String,
            required: false
        },
});
module.exports = mongoose.model("itemReservationModel", ItemReservationSchema);