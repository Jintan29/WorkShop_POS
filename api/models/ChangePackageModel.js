const conn = require('../connect');
const{ DataTypes} = require('sequelize')
const ChangePackageModel = conn.define('changePackage',{
    id:{
        type:DataTypes.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
    packageId:{
        type:DataTypes.BIGINT
    },
    userId:{
        type:DataTypes.BIGINT
    },
    payDate:{
        type:DataTypes.DATE
    },
    payHours:{
        type:DataTypes.BIGINT
    },
    payMinute:{
        type:DataTypes.BIGINT
    },
    payRemark:{
        type:DataTypes.BIGINT
    },
})

ChangePackageModel.sync({alter:true})

module.exports = ChangePackageModel