const express = require("express");
const Service = require("./Service");
const app = express();
const ChangePackageModel = require('../models/ChangePackageModel');
const { where } = require("sequelize");

app.get('/changPackage/list',Service.isLogin,async(req,res)=>{
    try{
        const PackageModel = require('../models/PackageModel')
        const MemberModel = require('../models/MemberModel')

        
        ChangePackageModel.belongsTo(PackageModel)
        ChangePackageModel.belongsTo(MemberModel,{
            foreignKey:{
                name:'userId'
            }
        })

        const results = await ChangePackageModel.findAll({
            order:[['id','DESC']],
            include:[
                {
                model:PackageModel
            },
            {
                model:MemberModel
            }
        ],
        where:{
            payDate:null //เอาเฉพาะที่ยังไม่จ่ายตัง
        },
        })

        res.send({message:'success',results:results})
    }catch(e){
        res.sendStatus = 500
        return res.send({message:e.message})
    }
})

app.post('/changePackage/saveChange',Service.isLogin,async(req,res)=>{
    try{
        await ChangePackageModel.update(req.body,{
            where: {
                id:req.body.id // pk ของ changepackage
            }
        }
        )
        return res.send({message:'success'})
    }catch(e){
        res.sendStatus = 500
        return res.send({message:e.message})
    }
})

app.post('/changePackage/reportSumSalePerDay',Service.isLogin,async(req,res)=>{
    try{
        //หาวันของเดือนที่เราส่งมา (day in months)
        let arr = []
        let y= req.body.year
        let m = req.body.month
        let dayInMont = new Date(y,m,0).getDate() //พฤจิ ได้ 30 

        const { Sequelize } = require('sequelize')
        const Op = Sequelize.Op

        //โยง Realtionไม่งั้นผลลัพไม่ออก
        const MemberModel = require('../models/MemberModel')
        const PackageModel = require('../models/PackageModel')

        ChangePackageModel.belongsTo(PackageModel)
        ChangePackageModel.belongsTo(MemberModel,{
            foreignKey:{
                name:'userId'
            }
        })

        // loop อ่านค่าตามจำนวนวัน
        for(let i =0 ; i <=dayInMont ; i++){
            const results = await ChangePackageModel.findAll({ //result ของแต่ละวัน
                where:{
                    payDate:{
                        [Op.ne]:null        //ne =  not equal(จะกรองเฉพาะ record ที่จ่ายตังแล้้ว)
                    },
                    [Op.and]:[ //มีหลายๆเงื่อนไขแล้วเอามา AND กัน
                      Sequelize.fn('EXTRACT(YEAR from "changePackage"."createdAt") = ',y) , //กระจายปีออกมา
                      Sequelize.fn('EXTRACT(MONTH from "changePackage"."createdAt") = ',m),
                      Sequelize.fn('EXTRACT(DAY from "changePackage"."createdAt") = ',i),//ตัวแปรที่วนลูปอยู่ในแต่ละวัน
                    ]
                },
                include:[
                    {
                    model:PackageModel,
                    attributes:['name','price']
                },{
                    model:MemberModel,
                    attributes:['name','phone']
                }
            ]
            })
            
            let sum = 0 //หาผลรวมราคา (ยอดรวมแต่ละวัน)
            for(let j=0 ; j<results.length ; j++){
                const item = results[j]
                sum += parseInt(item.package.price)
            }

            arr.push({
                day:i,
                results:results,
                sum:sum
            })
        }
        

        res.send({message:'success',results:arr})
    }catch(e){
        res.status =500
        return res.send({message: e.message})
    }
})

//รายเดือน
app.post('/changePackage/reportSumSalePerMonth',Service.isLogin,async(req,res)=>{
    try{
        let arr = []
        let y= req.body.year//ไม่ต้อเงรับเดือน

        const { Sequelize } = require('sequelize')
        const Op = Sequelize.Op

        //โยง Realtionไม่งั้นผลลัพไม่ออก
        const MemberModel = require('../models/MemberModel')
        const PackageModel = require('../models/PackageModel')

        ChangePackageModel.belongsTo(PackageModel)
        ChangePackageModel.belongsTo(MemberModel,{
            foreignKey:{
                name:'userId'
            }
        })

        // loop ตามเดือนมี 12 อยู่แล้ว
        for(let i =1 ; i <=12 ; i++){
            const results = await ChangePackageModel.findAll({ 
                where:{
                    payDate:{
                        [Op.ne]:null        //ne =  not equal(จะกรองเฉพาะ record ที่จ่ายตังแล้้ว)
                    },
                    [Op.and]:[ //มีหลายๆเงื่อนไขแล้วเอามา AND กัน
                      Sequelize.fn('EXTRACT(YEAR from "changePackage"."createdAt") = ',y) , 
                      Sequelize.fn('EXTRACT(MONTH from "changePackage"."createdAt") = ',i) //วนตามเดือน
                    ]
                },
                include:[
                    {
                    model:PackageModel,
                    attributes:['name','price']
                },{
                    model:MemberModel,
                    attributes:['name','phone']
                }
            ]
            })
            
            let sum = 0 //หาผลรวมราคา (ยอดรวมแต่ละวัน)
            for(let j=0 ; j<results.length ; j++){
                const item = results[j]
                sum += parseInt(item.package.price)
            }

            arr.push({
                month:i,
                results:results,
                sum:sum
            })
        }
        

        res.send({message:'success',results:arr})
    }catch(e){
        res.status =500
        return res.send({message: e.message})
    }
})

app.get('/changPackage/reportSumSalePerYear',Service.isLogin,async(req,res)=>{
    try{
        const myDate = new Date()
        let arr = []
        const y= myDate.getFullYear() //ไม่ได้รับปีมาเราหาจากตัวแปรเอา
        const startYear = (y-10) //10ปีย้อนหลัง
        
        const { Sequelize } = require('sequelize')
        const Op = Sequelize.Op

        //โยง Realtionไม่งั้นผลลัพไม่ออก
        const MemberModel = require('../models/MemberModel')
        const PackageModel = require('../models/PackageModel')

        ChangePackageModel.belongsTo(PackageModel)
        ChangePackageModel.belongsTo(MemberModel,{
            foreignKey:{
                name:'userId'
            }
        })

        // loop ตามเดือนมี 12 อยู่แล้ว
        for(let i =y ; i >=startYear ; i--){
            const results = await ChangePackageModel.findAll({ 
                where:{
                    payDate:{
                        [Op.ne]:null        //ne =  not equal(จะกรองเฉพาะ record ที่จ่ายตังแล้้ว)
                    },
                    [Op.and]:[ //เอาเฉพาะปี
                      Sequelize.fn('EXTRACT(YEAR from "changePackage"."createdAt") = ',i) 
                    ]
                },
                include:[
                    {
                    model:PackageModel,
                    attributes:['name','price']
                },{
                    model:MemberModel,
                    attributes:['name','phone']
                }
            ]
            })
            
            let sum = 0 //หาผลรวมราคา (ยอดรวมแต่ละปี)
            for(let j=0 ; j<results.length ; j++){
                const item = results[j]
                sum += parseInt(item.package.price)
            }

            arr.push({
                year:i,
                results:results,
                sum:sum
            })
        }
        

        res.send({message:'success',results:arr})
    }catch(e){
        res.status =500
        return res.send({message: e.message})
    }
})


module.exports = app