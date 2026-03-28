const Item = require("../models/itemModel");
const ItemReservation = require("../models/itemReservationModel");
const ItemReturn = require("../models/itemReturnModel");

const buildItemQuery = (id) => (Number.isNaN(Number(id)) ? { _id: id } : { item_id: Number(id) });

const getItems = async (req, res) => {
    try {
        const items = await Item.find();
        return res.status(200).json(items);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createItem = async (req, res) => {
    try {
        const {
            item_id,
            item_name,
            item_image,
            item_description,
            item_quantity_total,
            item_quantity_available
        } = req.body;

        const newItem = new Item({
            item_id,
            item_name,
            item_image,
            item_description,
            item_quantity_total,
            item_quantity_available
        });

        await newItem.save();
        return res.status(201).json({ item: newItem });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const updateItem = async (req, res) => {
    const id = req.params.id;
    try {
        const updated = await Item.findOneAndUpdate(
            buildItemQuery(id),
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Unable to update item" });
        }
        return res.status(200).json({ item: updated });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deleteItem = async (req, res) => {
    const id = req.params.id;
    try {
        const deleted = await Item.findOneAndDelete(buildItemQuery(id));
        if (!deleted) {
            return res.status(404).json({ message: "Unable to delete item" });
        }
        return res.status(200).json({ message: "Item successfully deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const reserveItem = async (req, res) => {
    const id = req.params.id;
    const {
        student_id,
        item_quantity_reserved = 1,
        item_reservation_return_date
    } = req.body;

    try {
        const item = await Item.findOne(buildItemQuery(id));
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (item.item_quantity_available < Number(item_quantity_reserved)) {
            return res.status(400).json({ message: "Not enough available quantity" });
        }

        item.item_quantity_available -= Number(item_quantity_reserved);
        await item.save();

        const reservation = new ItemReservation({
            item_reservation_id: `RES-${Date.now()}`,
            student_id,
            item_id: item.item_id,
            item_quantity_reserved: Number(item_quantity_reserved),
            item_reservation_status: "Reserved",
            item_reservation_return_date: item_reservation_return_date || new Date()
        });
        await reservation.save();

        return res.status(201).json({ reservation, item });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const returnItem = async (req, res) => {
    const id = req.params.id;
    const { item_reservation_id } = req.body;

    try {
        const reservationId = item_reservation_id || id;
        const reservation = await ItemReservation.findOne({ item_reservation_id: reservationId });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (reservation.item_reservation_status === "Returned") {
            return res.status(400).json({ message: "Item already returned" });
        }

        const item = await Item.findOne({ item_id: reservation.item_id });
        if (item) {
            item.item_quantity_available += reservation.item_quantity_reserved;
            await item.save();
        }

        reservation.item_reservation_status = "Returned";
        await reservation.save();

        const itemReturn = new ItemReturn({
            item_return_id: `RET-${Date.now()}`,
            item_reservation_id: reservation.item_reservation_id,
            item_return_date: new Date()
        });
        await itemReturn.save();

        return res.status(201).json({ itemReturn, reservation, item });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const cancelreservedItem = async (req, res) => {
    const id = req.params.id;

    try {
        const reservation = await ItemReservation.findOne({ item_reservation_id: id });
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (reservation.item_reservation_status === "Reserved") {
            const item = await Item.findOne({ item_id: reservation.item_id });
            if (item) {
                item.item_quantity_available += reservation.item_quantity_reserved;
                await item.save();
            }
        }

        await ItemReservation.deleteOne({ _id: reservation._id });
        return res.status(200).json({ message: "Item reservation cancelled successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getBookedItem = async (req, res) => {
    const id = req.params.id;
    try {
        const reservations = await ItemReservation.find({
            item_id: Number(id),
            item_reservation_status: "Reserved"
        });
        return res.status(200).json(reservations);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const returnBookedItem = async (req, res) => {
    const id = req.params.id;
    try {
        const reservations = await ItemReservation.find({ item_id: Number(id) });
        const reservationIds = reservations.map((r) => r.item_reservation_id);
        const returns = await ItemReturn.find({ item_reservation_id: { $in: reservationIds } });
        return res.status(200).json(returns);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getItems = getItems;
exports.getAllItems = getItems;
exports.createItem = createItem;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
exports.reserveItem = reserveItem;
exports.returnItem = returnItem;
exports.cancelreservedItem = cancelreservedItem;
exports.getBookedItem = getBookedItem;
exports.returnBookedItem = returnBookedItem;
