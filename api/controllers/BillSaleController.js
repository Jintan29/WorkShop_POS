const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const service = require("./Service");

const BillSaleModel = require("../models/BillSaleModel");
const BillSaleDetailModel = require("../models/BillSaleDetailModel");
const { where } = require("sequelize");

//เริ่มมาต้องทำการเปิดบิลรอไว้
app.get("/billSale/openBill", service.isLogin, async (req, res) => {
  try {
    const payload = {
      userId: service.getMemberId(req),
      status: "open",
    };

    let result = await BillSaleModel.findOne({
      where: payload,
    });

    if (result == null) {
      result = await BillSaleModel.create(payload);
    }

    res.send({ message: "success", result: result });
  } catch (e) {
    res.statusCode = 500;
    return res.send({ message: e.message });
  }
});

app.post("/billSale/sale", service.isLogin, async (req, res) => {
  try {
    //บันทึกลงDBจากบิลล่าสุด
    const payload = {
      userId: service.getMemberId(req),
      status: "open",
    };

    const currentBill = await BillSaleModel.findOne({
      //ค้นหาบิลล่าสุดของ usr คนนี้
      where: payload,
    });
    //เตรียม payload ไปสร้างข้อมูลในตาราง Detail(ข้อมูลของสินค้าที่ซื้อ)
    const item = {
      price: req.body.price,
      productId: req.body.id,
      billSaleId: currentBill.id, //เอาไปเป็นบิลแม่
      userId: payload.userId,
    };

    //หาข้อมูลบิลปัจจุบัน
    const billSaleDetail = await BillSaleDetailModel.findOne({
      where: item,
    });

    //ถ้าซื้อครั้งแรก
    if (billSaleDetail == null) {
      item.qty = 1;
      //บันทึกรายละเอียดการซื้อ
      const result = await BillSaleDetailModel.create(item);
    } else {
      //หากมีข้อมูลอยู่แล้วให้เพิ่มค่า qty (ซื้อซ้ำ)
      item.qty = parseInt(billSaleDetail.qty) + 1;
      await BillSaleDetailModel.update(item, {
        where: {
          id: billSaleDetail.id,
        },
      });
    }

    return res.send({ message: "success" });
  } catch (e) {
    res.status = 500;
    return res.send({ message: e.message });
  }
});

//นำบิลปัจจุบันและรายละเอียดทั้งหมดมาแสดง
app.get("/billSale/currentBillInfo", service.isLogin, async (req, res) => {
  const BillSaleDetailModel = require("../models/BillSaleDetailModel");
  const ProductModel = require("../models/ProductModel");

  BillSaleModel.hasMany(BillSaleDetailModel);
  BillSaleDetailModel.belongsTo(ProductModel);
  try {
    const result = await BillSaleModel.findOne({
      //เลือกบิลที่เปิดอยู่ของ user คนนี้
      where: {
        status: "open",
        userId: service.getMemberId(req),
      },
      include: {
        model: BillSaleDetailModel,
        order: [["id", "DESC"]], //ล่าสุดอยู่บน
        //จาก Detail โยงไปหา Product
        include: {
          model: ProductModel,
          attributes: ["name"],
        },
      },
    });
    return res.send({ message: "success", result: result });
  } catch (e) {
    res.status = 500;
    return res.send({ message: e.message });
  }
});

app.delete("/billSale/deleteItem/:id", service.isLogin, async (req, res) => {
  try {
    await BillSaleDetailModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    return res.send({ message: "success" });
  } catch (e) {
    res.status = 500;
    return res.send({ message: e.message });
  }
});

app.post("/billSale/updateQty", service.isLogin, async (req, res) => {
  try {
    await BillSaleDetailModel.update(
      {
        qty: req.body.qty,  //update only qty
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    return res.send({ message: "success" });
  } catch (e) {
    res.status = 500;
    return res.send({ message: e.message });
  }
});

app.get('/billSale/endSale',service.isLogin,async(req,res)=>{
  try{
    //จบการขายจะไปดูบิลที่เปิดอยู่ เพื่อไปปิดมัน
    await BillSaleModel.update({
      status:'payed'    //เปลี่ยนสถานะของบิลที่เปิดอยู่
    },{
    where:{
      status:'open',
      userId: service.getMemberId(req)
    }
  })
  return res.send({message:'success'})
  }catch(e){
    res.status =500
    return res.send({message:e.message})
  }
})

//บิลล่าสุด = อันที่ยังเป็น open
app.get('/billSale/lastBill',service.isLogin,async (req,res)=>{
  try{
    const BillSaleDetailModel = require('../models/BillSaleDetailModel')
    const ProductModel = require('../models/ProductModel')


    BillSaleModel.hasMany(BillSaleDetailModel)
    BillSaleDetailModel.belongsTo(ProductModel) //เพราเก็บ FK(productID)

    const result = await BillSaleModel.findAll({
      where:{
        status:'payed',
        userId: service.getMemberId(req) //ไม่งั้นติดของร้านอื่นมาด้วย
      },
      order:[['id','DESC']], //เอาอันล่าสุดมาอันเดียว
      limit:1,
      include:{
        model:BillSaleDetailModel,
        attributes:['qty','price'],
        include:{
          model:ProductModel,
          attributes:['barcode','name']
        }
      }
    })
    res.send({message:'success',result:result})

  }catch(e){
    res.status =500
    return res.send({message:e.message})
  }
})

app.get('/billSale/billToday',service.isLogin,async (req,res)=>{
  try{
    //เชื่อมหารายละเอียด , สินค้า เหมือนเดิม
    const BillSaleDetailModel = require('../models/BillSaleDetailModel')
    const ProductModel = require('../models/ProductModel')


    BillSaleModel.hasMany(BillSaleDetailModel)
    BillSaleDetailModel.belongsTo(ProductModel) 

    //เปลี่ยนแค่เงื่อนไขการ where , limit

    const startDate = new Date() //ได้ข้อมูลวันปัจจุบันออกมา
    startDate.setHours(0,0,0,0) //ดึงข้อมูลวันนี่ทั้งวัน ตั้งแต่ เที่ยงคืน-เที่ยงคืน(0.00-0.00)
    const now = new Date()
    now.setHours(23,59,59,59) //สิ้นสุดวัน
    const { Sequelize } = require('sequelize')
    const Op = Sequelize.Op     //เงื่อนไขในการกรองข้อมูลยากๆ


    const results = await BillSaleModel.findAll({
      where:{
        status:'payed',
        userId: service.getMemberId(req),
        //ดึงตามเวลา
        createdAt:{
          [Op.between]:[  //ดึงตามช่วงเวลา 2 ช่วง ใช้ []
            startDate.toISOString(),  //แปลงจาก date->str
            now.toISOString()
          ]
        } // oustput จะได้ออกมาเต็มวัน
      },
      order:[['id','DESC']], //เอาอันล่าสุดมาอันเดียว
      include:{
        model:BillSaleDetailModel,
        attributes:['qty','price'],
        include:{
          model:ProductModel,
          attributes:['barcode','name']
        }
      }
    })
    res.send({message:'success',result:results})


  }catch(e){
    res.status=500
    return res.send({message:e.message})
  }
})

app.get('/billSale/list',service.isLogin,async(req,res)=>{
  const BillSaleDetailModel = require('../models/BillSaleDetailModel')
  const ProductModel = require('../models/ProductModel')

  BillSaleModel.hasMany(BillSaleDetailModel) //ดึงรายละเอียดมาด้วย
  BillSaleDetailModel.belongsTo(ProductModel)
  

  try{
    const results = await BillSaleModel.findAll({
      order:[['id','DESC']],
      // ต้องกรองสถานะก่อนไปแสดง
      where:{
        status:'payed',
        userId: service.getMemberId(req)
      },
      include:{
        model:BillSaleDetailModel,
        include:{
          model:ProductModel
        }
      }
    })
    return res.send({message:'success',results:results})
  }catch(e){
    res.status=500
    return res.send({message:e.message})
  }
})

//ดึงข้อมูล5ปี
app.get('/billSale/listByYearAndMonth/:year/:month',service.isLogin,async (req,res)=>{
  try{
    let arr = []
    let y = req.params.year  
    let m = req.params.month
    let dayInMonth = new Date(y,m,0).getDate() //มีกี่วันในเดือนที่เราใส่เข้ามา

    const { Sequelize } = require('sequelize')
    const Op = Sequelize.Op

    const BillSaleDetailModel =  require('../models/BillSaleDetailModel')
    const ProductModel = require('../models/ProductModel')

    BillSaleModel.hasMany(BillSaleDetailModel)
    BillSaleDetailModel.belongsTo(ProductModel)

    for(let i=1 ; i<dayInMonth;i++){ //วนลูปดึงค่าใน DB
      const results = await BillSaleModel.findAll({
        where:{
          [Op.and]:[ //มีหลายๆเงื่อนไขแล้วเอามา AND กัน
            Sequelize.fn('EXTRACT(YEAR from "billSaleDetails"."createdAt") = ',y) , //กระจายปีออกมา
            Sequelize.fn('EXTRACT(MONTH from "billSaleDetails"."createdAt") = ',m),
            Sequelize.fn('EXTRACT(DAY from "billSaleDetails"."createdAt") = ',i),//ตัวแปรที่วนลูปอยู่ในแต่ละวัน
          ],
          userId: service.getMemberId(req) 
        },
        include:{
          model:BillSaleDetailModel,
          include:{
            model:ProductModel
          }
        }
      })

      //หาผลรวมของยอดบิลทั้งหมด
      let sum =0;

      for(let j= 0 ; j < results.length; j++){ //วันตามจำนวนบิลทั้งหมดของวันนั้น
        const result = results[j]; //เข้าถึงบิลแต่ละตัว

          for (let k = 0; k < result.billSaleDetails.length; k++) { // วนลูปดูรายละเอียดแต่ละรายการ
            const item = result.billSaleDetails[k];
            sum += parseInt(item.qty) * parseInt(item.price); // คำนวณยอดรวม
          }
        }

      arr.push({
        day:i,
        results:results,
        sum:sum
      }) 
    }

    return res.send({message:'success',results:arr})
    
  }catch(e){
    res.status=500
    return res.send({message:e.message})
  }
})

module.exports = app;
