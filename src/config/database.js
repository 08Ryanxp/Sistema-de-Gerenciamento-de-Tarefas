const mongoose = require(`mongoose`);

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB conectado com sucesso`);
    }catch (error) {
        console.error(`Erro ao conectar ao MongoDB`, error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
