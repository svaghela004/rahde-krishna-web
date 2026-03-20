const mongoose = require("mongoose");

const trustSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['member', 'payment'],
        default: 'member'
    },
    name: {
        type: String,
        required: function () {
            return this.type !== 'payment';
        },
    },
    number: {
        type: Number,
        required: function () {
            return this.type !== 'payment';
        },
    },
    position: {
        type: String,
        required: function () {
            return this.type !== 'payment';
        },
    },
    status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending'
    },
    amount: {
        type: Number,
        default: 100
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId
    },
    memberName: {
        type: String
    },
    memberPhone: {
        type: String
    },
    month: {
        type: String
    },
    year: {
        type: Number
    },
    paid: {
        type: Boolean
    },
    paidDate: {
        type: Date
    },
    receiptNo: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Trust', trustSchema);
