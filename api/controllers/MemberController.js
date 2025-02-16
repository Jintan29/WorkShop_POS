const express = require("express");
const app = express();
const MemberModel = require('../models/MemberModel')
const jwt = require('jsonwebtoken');
const service = require('./Service');
const PackageModel = require("../models/PackageModel");

require('dotenv').config()


app.post('/member/signin' , async (req,res) =>{
    try{
        const member = await MemberModel.findAll({
            //เงื่อนไขการดึง
            where:{
                phone: req.body.phone,
                pass: req.body.pass
            }
        })

        if(member.length>0){
            token = jwt.sign({id:member[0].id} ,process.env.secret)// สร้าง token
            return res.send({token: token ,id: member[0].id, message:'succes'})
        }

        return res.send({status:401, message:'not found'})

    }catch(err){
        console.log(err);
        res.status(500).send({error: 'Server Error'})
        
    }
})

app.get('/member/info', service.isLogin,async(req,res)=>{
    try{
        const token = service.getToken(req) // get token
        const payload = jwt.decode(token)
        
        const member = await MemberModel.findByPk(payload.id,{
            attributes:['id','name'],
            include:[
                {model:PackageModel,
                    attributes:['name','bill_amount']
                } //load relation
            ]
        })
        
        res.send({result:member,message:'success'})
    }catch(e){
        console.log(e);
        res.status(500).send({error: e.message})
    }
})

app.put('/member/ChangeProfile',service.isLogin,async(req,res)=>{
    try{
        const memberId = service.getMemberId(req)
        const payload  = {
            name:req.body.name
        }
        const result = await MemberModel.update(payload,{
            where:{
                id:memberId
            }
        })

        return res.send({message:'success',result:result})

    }catch(e){
        res.statusCode(500);
        return res.send({message:e.message})
    }
})

app.get('/member/list',service.isLogin,async (req,res)=>{
    try{
        const PackageModel = require('../models/PackageModel')
        MemberModel.belongsTo(PackageModel)

        const results = await MemberModel.findAll({
            order:[['id','DESC']],
            attributes:['id','name','phone','createdAt'],
            include:{
                model:PackageModel
            }
        })

        return res.send({message:'success',results:results})
    }catch(e){
        res.status = 500 
        return res.send({message:e.message})
    }
})

module.exports = app;