const Transaction = require('../../models/Transaction/TransactionSchema')

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate('products.product').populate('suppliers');

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}