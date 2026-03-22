const ItemReturn = require("../models/itemReturnModel");

const getAllItemReturns = async (req, res,next) => {
    try {
        const itemReturns = await ItemReturn.find();
        if (!itemReturns || itemReturns.length === 0) {
            return res.status(404).json({ message: "No item returns found" });
        }
        return res.status(200).json(itemReturns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Data insert
const createItemReturn = async (req, res,next) => {
    const { item_return_id, item_reservation_id, item_return_date } = req.body;
    let itemReturns;
    try {
        itemReturns = new ItemReturn({
            item_return_id, 
            item_reservation_id   ,
            item_return_date
        });
        await itemReturns.save();
    } catch (error) {
        console.log(error);
    }

    //not inserted  
    if (!itemReturns) {
        return res.status(404).send({ message: "Unable to create item return" });
    }   
    return res.status(200).json({itemReturns});
};

//Data Update

const updateItemReturn = async (req, res,next) => { 
    const id = req.params.id;
    const { item_return_id, item_reservation_id, item_return_date } = req.body;
    let itemReturns;
    try {
        itemReturns = await ItemReturn.findByIdAndUpdate(id, {
            item_return_id, 
            item_reservation_id   ,
            item_return_date
        });
        itemReturns = await itemReturns.save();
    } catch (error) {
        console.log(error);
    }
    //not updated
    if (!itemReturns) {
        return res.status(404).send({ message: "Unable to update item return" });
    }   
    return res.status(200).json({itemReturns});
};

//Data Delete

const deleteItemReturn = async (req, res,next) => { 
    const id = req.params.id;
    let itemReturns;
    try {
        itemReturns = await ItemReturn.findByIdAndRemove(id);
    } catch (error) {
        console.log(error);
    }
    //not deleted
    if (!itemReturns) {
        return res.status(404).send({ message: "Unable to delete item return" });
    }
    return res.status(200).json({ message: "Item return deleted successfully" });
};


exports.deleteItemReturn = deleteItemReturn;
exports.updateItemReturn = updateItemReturn;
exports.getAllItemReturns = getAllItemReturns;
exports.createItemReturn = createItemReturn;