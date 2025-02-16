const express = require("express");
const app = express();
const PackageModel = require('../models/PackageModel')
const MemberModel = require('../models/MemberModel');
const BankModel = require('../models/BankModel')
const Service = require("./Service");



app.get('/package/list',async(req,res)=>{
    try{
        const result = await PackageModel.findAll({
            order:['price']
        })
        res.send({result: result})
    }catch(err){
        console.log(err)
        res.status(500).send({error: 'Server Error'})
    }
    
})

// API สำหรับการสมัครสมาชิคร้านค้า
app.post('/package/memberRegister' , async(req,res) =>{
    try{
        const result = await MemberModel.create(req.body);
        res.send({result: result})
    }catch(err){
        res.send({message: err.message})
    }
})

//นับจำนวนยอดบิลที่ขายไป
app.get('/package/countBill',Service.isLogin,async(req,res)=>{
    const BillSaleModel = require('../models/BillSaleModel')

    const { Sequelize } = require('sequelize')
    const Op = Sequelize.Op;
    const myDate = new Date()
    const m = myDate.getMonth() + 1


    try{
        const results = await BillSaleModel.findAll({
            where:{
                userId:Service.getMemberId(req), 
                [Op.and]:[ 
                    Sequelize.fn('EXTRACT(MONTH from "createdAt") = ',m)
                  ],
            }
        })
        res.send({totalBill: results.length})
    }catch(e){
        res.status = 500
        return res.send({message:e.message})
    }
})

app.get('/package/changePackage/:id',Service.isLogin,async(req,res)=>{
    try{
        const ChangePackageModel = require('../models/ChangePackageModel')

        const payload = {
            userId: Service.getMemberId(req),
            packageId:req.params.id
        }

        await ChangePackageModel.create(payload)
        res.send({message:'success'})

    }catch(e){
        res.status=500
        return res.send({message:e.message})
    }
})

module.exports = app;