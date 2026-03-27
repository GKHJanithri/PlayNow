const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const  ItemSchema = new Schema({
    item_id : {
        type : Number,//datatype
        required : true},//validation
   item_name : {
       type : String,//datatype
       required : true},//validation
    item_description : {
        type : String,
        required : true},
    item_quantity_total : {
        type : Number,
        required : true},   
    item_quantity_available : {
        type : Number,
        required : true},
    item_created_at : {
        type : Date,
        default : Date.now}
});


module.exports = mongoose.model("itemModel", ItemSchema);