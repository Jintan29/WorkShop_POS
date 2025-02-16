const express = require("express");
const app = express();
const BankModel = require('../models/BankModel')

app.get('/bank/list',async(req,res)=>{
    try{
        const results = await BankModel.findAll() //ไม่แยกตาม user
        return res.send({message:'success',results:results})
    }catch(e){
        res.sendStatus=500
        return res.send({message:e.message})
    }
})

module.exports = app;