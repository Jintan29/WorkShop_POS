const express = require("express");
const app = express();
const ProductModel = require('../models/ProductModel')
const service = require('./Service')

app.post('/product/insert',service.isLogin,async(req,res)=>{
    try{
        //เพิ่มการเก็บข้อมูลของ user
        let payload = req.body
        payload.userId = service.getMemberId(req)


        const result = await ProductModel.create(payload);
        res.send({result:result,message:'success'})
    }catch(e){
        res.statusCode = 500;
        return res.send({message:e.message})
    }
})

app.get('/product/list',service.isLogin,async(req,res)=>{
    try{
        const result = await ProductModel.findAll({
            where:{
                userId:service.getMemberId(req)
            },
            order:[['id','DESC']] //ใหม่สุดอยู่บน
        })

        return res.send({result:result,message:'success'})
    }catch(e){
        res.statusCode = 500;
        return res.send({message:e.message})
    }
})

app.delete('/product/delete/:id',service.isLogin,async(req,res)=>{
    try{
        const result = await ProductModel.destroy({
            where:{
                id:req.params.id
            }
        })
        return res.send({message:'success',result:result})
    }catch(e){
        res.statusCode = 500;
        return res.send({message:e.message})
    }
})

//update ใช้ post เหมือน insert เพื่อความสะดวก
app.post('/product/update',service.isLogin,async(req,res)=>{
    try{
        let payload = req.body
        payload.userId = service.getMemberId(req)

        const result = await ProductModel.update(req.body,{
            where:{
                id:req.body.id
            }
            
        })
        return res.send({message:'success',result:result})
    }catch(e){
        res.statusCode=500;
        return res.send({message:e.message})
    }
})

//ดึงสินค้า+รูป
app.get('/product/listForSale',service.isLogin,async(req,res)=>{
    const ProductImageModel = require('../models/ProductImageModels')
    ProductModel.hasMany(ProductImageModel); //เชื่อม Relation

    try{
        const result = await ProductModel.findAll({
            where:{
                userId: service.getMemberId(req)
            },
            order:[['id','DESC']],
            include:{               //ดึงตารางรูปมาแสดง
                model:ProductImageModel,
                where:{
                    isMain:true,
                }
            }
        })
        res.send({message:'success',result:result})
    }catch(e){
        res.statusCode =500
        return res.send({message:e.message})
    }
})

module.exports = app;