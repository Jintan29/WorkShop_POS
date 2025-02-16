const express = require("express");
const app = express();
const service = require("./Service");
const StockModel = require('../models/StockModel')

app.post('/stock/save',service.isLogin,async(req,res)=>{
    try{
        let payload = {
            qty: req.body.qty,
            productId: req.body.productId,
            userId: service.getMemberId(req)
        }
        
        await StockModel.create(payload)

        return res.send({message:'success'})

    }catch(e){
        res.status = 500
        return res.send({message:e.message})
    }
})


app.get('/stock/list',service.isLogin,async (req,res)=>{
    try{
        const ProductModel = require('../models/ProductModel')
        StockModel.belongsTo(ProductModel)

        const results = await StockModel.findAll({
            where:{
                userId: service.getMemberId(req)
            },
            order:[['id','DESC']], // หลังมาแสดงด้านบน
            include:{
                model:ProductModel
            }
        })
        return res.send({message:'success',results:results})
    }catch(e){
        res.status = 500
        return res.send({message:e.message})
    }
})

app.delete('/stock/delete/:id',service.isLogin,async(req,res)=>{
    try{    
        await StockModel.destroy({
            where:{
                userId: service.getMemberId(req), //มีหรือไม่มีก็ได้
                id: req.params.id
            }
        })

        return res.send({message:'success'})
    }catch(e){
        res.status = 500
        return res.send({message:e.message})
    }
})

//stock -> {product,billSaleDetails} , ถ้าขาย = ลดจำนวนของใน stock ? 
app.get('/stock/report',service.isLogin, async(req,res)=>{
    try{
        const ProductModel = require('../models/ProductModel')
        const BillSaleDetailsModel = require('../models/BillSaleDetailModel')

        ProductModel.hasMany(StockModel)
        ProductModel.hasMany(BillSaleDetailsModel)

        StockModel.belongsTo(ProductModel)
        BillSaleDetailsModel.belongsTo(ProductModel)

        let arr = []

        const results = await ProductModel.findAll({
            include:[
                {
                    model:StockModel,
                    include:{
                        model:ProductModel
                    }
                },{
                    model:BillSaleDetailsModel,
                    include:{
                        model:ProductModel
                    }
                }
            ],
            where:{
                userId: service.getMemberId(req)
            }
        })

        //วนลูปอ่านค่าทีละชุด
        for(let i=0; i<results.length ; i++){
            const result = results[i]
            const stocks = result.stocks //เข้าถึงผ่าน Realtions
            const billSaleDetails = result.billSaleDetails //เข้าถึงผ่าน Realtions

            let stockIn = 0
            let stockOut = 0
            
            //เมื่อไหร่ที่รับของเข้า stock ค่าของ stockIn จะเพิ่มขึ้นเรื่อยๆตามจำนวน
            for(let j =0 ; j < stocks.length ; j++ ){
                const item = stocks[j]
                stockIn += parseInt(item.qty)
            }

            //เมื่อไหร่ที่ขายสินค้าออกไปจะเอาค่าในบิลดีเทล ไปเพิ่มค่า stockOut

            for(let j =0 ; j<billSaleDetails.length ; j++){
                const item = billSaleDetails[j]
                stockOut += parseInt(item.qty)
            }

            arr.push({
                result:result, // สินค้าแต่ละตัว
                stockIn:stockIn,
                stockOut:stockOut
            })
        }

        return res.send({message:'success',results:arr})

    }catch(e){
        res.status = 500
        return res.send({message:e.message})
    }
})


module.exports = app