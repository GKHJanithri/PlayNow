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

exports.getAllItemReservations = getAllItemReservations;