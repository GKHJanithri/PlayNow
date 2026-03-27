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
const createItem = async (req, res) => {
  try {
    console.log("Incoming data:", req.body); // debug

    const totalQty = Number(req.body.item_quantity_total);
    const availableQty = Number(req.body.item_quantity_available);

    const newItem = new Item({
      item_id: Number(req.body.item_id),
      item_name: req.body.item_name,
      item_image: req.body.item_image,
      item_description: req.body.item_description,
      item_quantity_total: totalQty,
      item_quantity_available: availableQty,
    });

    const savedItem = await newItem.save();

    return res.status(201).json(savedItem); 
  } catch (error) {
    console.error("CREATE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

//Data Update 

const updateItem = async (req, res,next) => {
    const id = req.params.id;
    const {
        item_name,
        item_image,
        item_description,
        item_quantity_total,
        item_quantity_available
    } = req.body;
    let items;
    try {
        items = await Item.findByIdAndUpdate(
            id,
            {
                item_name,
                item_image,
                item_description,
                item_quantity_total: Number(item_quantity_total),
                item_quantity_available: Number(item_quantity_available)
            },
            { new: true, runValidators: true }
        );
    }   catch (error) { 
        return res.status(500).json({ message: error.message });
    }

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
        return res.status(500).json({ message: error.message });
    }   

    if (!items) {
        return res.status(404).send({ message: "Unable to delete item" });
    }       
    return res.status(200).json({message: "Item successfully deleted"});
};
exports.getAllItems = getAllItems;
exports.createItem = createItem;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
