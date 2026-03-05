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


exports.getAllItems = getAllItems;

