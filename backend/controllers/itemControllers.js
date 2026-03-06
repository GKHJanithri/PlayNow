const Item = require("../models/itemModel");


const getAllItems = async (req, res,next) => {
    try {
        const items = await Item.find();
        if (!items || items.length === 0) {
            return res.status(404).json({ message: "No items found" });
        }
        return res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//Data insert
const createItem = async (req, res,next) => {
    const { item_name, item_description, item_quantity } = req.body;
    let items;
    try {
        
        items = new Item({
            item_name,
            item_description,
            item_quantity
        });
        await items.save();
    } catch (error) {
        console.log(eer);
    }
    //not inserted
    if (!items) {
        return res.status(404).send({ message: "Unable to create item" });
    }
    return res.status(200).json({items});
};

//Data Update 

const updateItem = async (req, res,next) => {
    const id = req.params.id;
    const { item_name, item_description, item_quantity } = req.body;    
    let items;
    try {
        items = await Item  .findByIdAndUpdate(id, {
            item_name,
            item_description,
            item_quantity
        });
        items = await items.save();
    }   catch (error) { 
        console.log(error);
    }
    //not updated
    if (!items) {
        return res.status(404).send({ message: "Unable to update item" });
    }   
    return res.status(200).json({items});
};

//Data delete
const deleteItem = async (req, res,next) => {
    const id = req.params.id;
    let items;
    try {
        items = await Item.findByIdAndRemove(id);
    }
    catch (error) {
        console.log(error);
    }   
    //not deleted
    if (!items) {
        return res.status(404).send({ message: "Unable to delete item" });
    }       
    return res.status(200).json({message: "Item successfully deleted"});
};
exports.getAllItems = getAllItems;
exports.createItem = createItem;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
