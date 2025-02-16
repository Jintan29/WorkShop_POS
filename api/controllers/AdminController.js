const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const Service = require('./Service')
require('dotenv').config()

const AdminModel = require('../models/AdminModel')

app.post('/admin/signin' , async (req,res) =>{
    try{
        const admin = await AdminModel.findOne({
            //เงื่อนไขการดึง
            where:{
                usr: req.body.usr,
                pwd: req.body.pwd
            }
        })

        if(admin != null){
            token = jwt.sign({id:admin.id} ,process.env.secret)// สร้าง token
            return res.send({token: token , message:'success'})
        }else{
            res.status = 401
            return res.send({ message:'not found'})
        }

        

    }catch(err){
        res.status=500
        res.send({error: e.message})
        
    }
})

app.get('/admin/info', Service.isLogin,async(req,res)=>{
    try{      
        const adminId = Service.getAdminId(req)
        
        const admin = await AdminModel.findByPk(adminId,{
            attributes:['id','name','level','usr']
        })
        
        res.send({result:admin,message:'success'})
    }catch(e){
        res.status=500
        res.send({error: e.message})
    }
})

app.post('/admin/create',Service.isLogin,async(req,res)=>{
    try{
        await AdminModel.create(req.body)
        return res.send({message:'success'})
    }catch(e){
        res.status=500
        res.send({error: e.message})
    }
})

app.get('/admin/list',Service.isLogin,async(req,res)=>{
    try{
        const results = await AdminModel.findAll({
            attributes:['id','name','usr','level','email']
        })
        res.send({message:'success',results:results})
    }catch(e){
        res.status=500
        res.send({error: e.message})
    }
})

app.delete('/admin/delete/:id',Service.isLogin,async(req,res)=>{
    try{
        await AdminModel.destroy({
            where:{
                id:req.params.id
            }
        })
        return res.send({message:'success'})
    }catch(e){
        res.status=500
        res.send({error: e.message})
    }
})

app.post('/admin/edit/:id',Service.isLogin,async(req,res)=>{
    try{
        
        await AdminModel.update(req.body,{
            where:{
                id:req.params.id
            }
        })
        return res.send({message:'success'})
    }catch(e){
        res.status=500
        return res.send({error: e.message})
    }
})

app.post('/admin/changeProfile',Service.isLogin,async(req,res)=>{
    try{
        await AdminModel.update(req.body,{
            where:{
                id:req.body.id
            }
            
        })
        res.send({message:'success'})
    }catch(e){
        res.status=500
        return res.send({error: e.message})
    }
})

module.exports = app;