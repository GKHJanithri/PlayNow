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


exports.getAllItemReturns = getAllItemReturns;