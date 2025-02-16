const express = require("express");
const Service = require("./Service");
const app = express();
const ProductImageModel = require("../models/ProductImageModels");
//เก็บ File
const fileUpload = require("express-fileupload");
const { where } = require("sequelize");
app.use(fileUpload()); //นำLIB มาใช้ใน app ของเรา

//ใช้ลบไฟล์
const fs = require('fs')

app.post("/productImage/insert", Service.isLogin, async (req, res) => {
  //ดักรับ payload
  try {
    //Rename  เพื่อให้ unique
    const myDate = new Date();
    const y = myDate.getFullYear();
    const m = myDate.getMonth();
    const d = myDate.getDate();
    const h = myDate.getHours();
    const mm = myDate.getMinutes();
    const s = myDate.getSeconds();
    const ms = myDate.getMilliseconds();

    const productImage = req.files.productImage;

    const newName =
      y + "-" + m + "-" + d + "-" + h + "-" + mm + "-" + s + "-" + ms; 
    const arr = productImage.name.split("."); // แยกเอานามสกุล file
    const ext = arr[arr.length - 1];
    const fullNewName = newName + "." + ext;

    
    const uploadPath = __dirname + "/../uploads/" + fullNewName;

    //mv = move
    await productImage.mv(uploadPath, async (err) => {
      if (err) throw new Error(err);
      //insert to DB
      await ProductImageModel.create({
        isMain: false,
        imgName: fullNewName,
        productId: req.body.productId,
      });

      res.send({ message: "success" });
    });
  } catch (e) {
    res.statusCode = 500;
    return res.send({ message: e.message });
  }
});

//ดึงรูป
app.get("/productImage/list/:productId",Service.isLogin,async (req, res) => {
  // return res.send({productId_is  : req.params.productId})
  try{
    const result = await ProductImageModel.findAll({
      where:{
        productId: req.params.productId
        //เรียง ใหม่บน เก่าล่าง
      },
      order:[['id','DESC']]

    })
    return res.send({message:'success',result:result})
  }catch(e){
    console.log(e);
    res.statusCode =500
    return res.send({message:e.message})
    
  }
}
);

//ลบใน DB แล้วต้องไปทำลายรูปภาพใน Folder อีก !!
app.delete("/productImage/delete/:id", Service.isLogin, async (req, res) => {
  try{
    const row =  await ProductImageModel.findByPk(req.params.id) //ดึง Rec ไปหาชื่อรูป
    const imgName = row.imgName

    //ลบในDB
    await ProductImageModel.destroy({
      where:{
        id:req.params.id
      }
    })

    //ลบใน Folder
     fs.unlinkSync('uploads/'+imgName);

    return res.send({message:'success'})
  }catch(e){
    res.statusCode =500
    return res.send({message:e.message})
  }
});


//เลือกภาพหลัก
app.get('/productImage/chooseMainImage/:id/:productId',Service.isLogin,async(req,res)=>{
  try{
    //ทำงาน2คำสี่ง
    await ProductImageModel.update({
      isMain:false  
    },{
      where:{
        productId:req.params.productId //update ให้ product ชิ้นนี้ทุกตัว F ก่อน แล้วค่อย set T ให้กับรูปที่เลือก
      }

    })
    
    await ProductImageModel.update({  //set T ให้กับ ProImg ที่เสขเลข id มา
      isMain:true
    },{
      where:{
        id:req.params.id
      }
    })
    return res.send({message:'success'})
  }catch(e){
    res.statusCode  =500;
    return res.send({message:e.message})
  }
})

module.exports = app;
