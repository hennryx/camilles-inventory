const Suppliers = require("../../models/Supplier/SupplierSchema");

exports.getAllSuppliers = async (req, res) => {
    try {
        const users = await Suppliers.find();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}