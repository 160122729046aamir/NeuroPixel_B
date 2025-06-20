import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId:{type: String, required: true},
    date:{type: Date, required: true},
    plan:{type: String, required: true},
    credits:{type: Number, required: true},
    payment:{type: Boolean, default: false},
    amount:{type: Number, required: true}
});

const Transaction = mongoose.models.transactions || new mongoose.model("Transaction",transactionSchema);

export default Transaction;