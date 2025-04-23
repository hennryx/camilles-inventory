const Purchase = require("../../models/Purchase/PurchaseSchema")

exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find()

        res.status(200).json({
            success: true,
            data: purchases,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.savePurchase = async (req, res) => {
    try {
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No purchase data provided."
            });
        }

        const purchase = await Purchase.create(data);

        if (!purchase) {
            return res.status(400).json({
                success: false,
                message: "Failed to save purchase."
            });
        }


        res.status(201).json({
            success: true,
            message: "Purchase saved successfully!",
            purchase
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "An unexpected error occurred while saving the purchase."
        })
    }
}

exports.updatePurchase = async (req, res) => {
    try {
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No purchase data provided."
            });
        }

        if (!data._id) {
            return res.status(400).json({
                success: false,
                message: "No Record Found"
            });
        }

        const purchase = await Purchase.findByIdAndUpdate(data._id, data, { new: true });

        if (!purchase) {
            return res.status(400).json({
                success: false,
                message: "No record Found"
            });
        }

        res.status(200).json({
            message: "Purchase record updated successfully",
            purchase: purchase,
            success: true
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }

}

exports.deletePurchase = async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Missing Id"
            })
        }

        const purchase = await Purchase.findByIdAndDelete(_id);

        if (!purchase) {
            return res.status(400).json({
                success: false,
                message: "No record Found"
            });
        }

        res.status(200).json({
            message: "Purchase deleted successfully",
            purchase: purchase,
            success: true
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }

}