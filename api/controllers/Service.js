module.exports = {
  getToken: (req) => {
    //ถอดจาก token
    const headers = req.headers;
    return (auth = headers.authorization.replace("Bearer ", "")); //เอาช่องว่างออกเอาแต่ token
  },

  //auth
  isLogin: (req, res, next) => {
    require("dotenv").config();
    const jwt = require("jsonwebtoken");

    if (req.headers.authorization != null) {
      const token = req.headers.authorization.replace("Bearer ", "");
      const secret = process.env.secret;
      try {
        const verify = jwt.verify(token, secret);

        if (verify != null) {
          return next();
        }
      } catch (e) {
        res.statusCode = 401;
        
        return res.send("invalid token");;
      }
    }
    res.statusCode = 401;
    res.send("authorize failed");
  },

  getMemberId: (req)=>{
    const jwt = require("jsonwebtoken");
    const token = req.headers.authorization.replace("Bearer ", "");
    const payload = jwt.decode(token)
    return payload.id;
  },

  getAdminId: (req)=>{
    const jwt = require("jsonwebtoken");
    const token = req.headers.authorization.replace("Bearer ", "");
    const payload = jwt.decode(token)
    return payload.id;
  }
  
};

