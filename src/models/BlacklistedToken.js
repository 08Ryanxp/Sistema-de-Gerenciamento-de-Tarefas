const mongoose = require(`mongoose`);

const blacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 84600
    }
});

module.exports = mongoose.model(`BlacklistedToken`, blacklistedTokenSchema);