const conn = require('../connect');
const{ DataTypes} = require('sequelize')

const BankModel = conn.define('bank',{
    id:{
        type:DataTypes.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
    bankType: {
        type:DataTypes.STRING
    },
    bankCode:{
        type:DataTypes.STRING
    },
    bankName:{
        type:DataTypes.STRING
    },
    bankBranch:{
        type:DataTypes.STRING
    }
})

BankModel.sync({alter:true});
module.exports = BankModel;