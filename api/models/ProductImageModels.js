const conn = require('../connect');
const{DataType, DataTypes} = require('sequelize')

const ProductImageModel = conn.define('productImage',{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    productId:{
        type:DataTypes.BIGINT
    },
    imgName:{
        type:DataTypes.STRING
    },
    isMain:{
        type:DataTypes.BOOLEAN
    }
})

ProductImageModel.sync({alter:true})

module.exports = ProductImageModel;