const express = require("express");
const app = express();
const service = require('./Service')
const UserModel = require('../models/UserModel');
const { where } = require("sequelize");

app.get('/user/list',service.isLogin,async(req,res)=>{
    try{
        const result = await UserModel.findAll({
            where:{
                userId:service.getMemberId(req)
            },
            attributes:['id','level','name','usr'],
            order:[['id','DESC']]
        })
        return res.send({message:'success',result:result})
    }catch(e){
        res.statusCode = 500
        return res.send({message:e.message})
    }
})

app.post('/user/insert',service.isLogin,async(req,res)=>{
    try{
        let payload = req.body
        payload.userId = service.getMemberId(req)
        await UserModel.create(payload);
        res.send({message:'success'})
    }catch(e){
        res.statusCode = 500
        return res.send({message:e.message})
    }
})

app.delete('/user/delete/:id',service.isLogin,async(req,res)=>{
    try{
        await UserModel.destroy({
            where:{
                id:req.params.id
            }
        })
        return res.send({message:'success'})
    }catch(e){
        res.statusCode = 500
        return res.send({message:e.message})
    }
})

app.post('/user/edit',service.isLogin,async(req,res)=>{
    try{
        
        let payload = req.body
        payload.userId = service.getMemberId(req)

        await UserModel.update(
            payload,
            {
                where: {
                    id: payload.id
                }
            }
        );
        return res.send({message:'success'})
    }catch(e){
        res.status = 500
        return res.send({message:e.message})
    }
})

module.exports = app