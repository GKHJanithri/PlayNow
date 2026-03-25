const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const  ItemReservationSchema = new Schema({
   item_reservation_id : {
       type : String,//datatype
       required : true},//validation
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
    item_reservation_time: {
        type : Date,
        default : Date.now},
    item_reservation_return_time: {
         type : Date,
         default : Date.now}
});
module.exports = mongoose.model("itemReservationModel", ItemReservationSchema);