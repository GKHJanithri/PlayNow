const ItemReservation = require("../models/itemReservationModel");

const getAllItemReservations = async (req, res,next) => {
    try {
        const itemReservations = await ItemReservation.find();
        if (!itemReservations || itemReservations.length === 0) {
            return res.status(404).json({ message: "No item reservations found" });
        }
        return res.status(200).json(itemReservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Data insert
const createItemReservation = async (req, res,next) => {
    const { item_id, student_id, item_reservation_date, item_reservation_return_date } = req.body;
    let itemReservations;
    try {
        itemReservations = new ItemReservation({
            item_id,
            student_id,
            item_reservation_date,
            item_reservation_return_date
        });
        await itemReservations.save();
    } catch (error) {
        console.log(error);
    }
    //not inserted
    if (!itemReservations) {
        return res.status(404).send({ message: "Unable to create item reservation" });
    }
    return res.status(200).json({itemReservations});
};

//Data Update

const updateItemReservation = async (req, res,next) => {
    const id = req.params.id;
    const { item_id, student_id, item_reservation_date, item_reservation_return_date } = req.body;
    let itemReservations;
    try {
        itemReservations = await ItemReservation.findByIdAndUpdate(id, {
            item_id,
            student_id,
            item_reservation_date,
            item_reservation_return_date
        });
        itemReservations = await itemReservations.save();
    } catch (error) {
        console.log(error);
    }   
    //not updated
    if (!itemReservations) {
        return res.status(404).send({ message: "Unable to update item reservation" });
    }
    return res.status(200).json({itemReservations});
};

//Data delete

const deleteItemReservation = async (req, res,next) => {
    const id = req.params.id;
    let itemReservations;   
    try {
        itemReservations = await ItemReservation.findByIdAndRemove(id);
    } catch (error) {
        console.log(error);
    }   
    //not deleted   
    if (!itemReservations) {
        return res.status(404).send({ message: "Unable to delete item reservation" });
    }   
    return res.status(200).json({ message: "Item reservation deleted successfully" });
};

exports.deleteItemReservation = deleteItemReservation;  
exports.updateItemReservation = updateItemReservation;  
exports.getAllItemReservations = getAllItemReservations;
exports.createItemReservation = createItemReservation;