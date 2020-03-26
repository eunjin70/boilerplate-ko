const {User} = require("../model/User");

let auth= (req, res, next)=>{
//인증처리

//client에서 token 가자오기
let token = req.cookies.x_auth;

//토큰 복호화해서 유저 찾기
User.findByToken(token, (err, user)=>{
  if(err) throw err;
  if(!user) return res.json({isAuth:false, error:true})

  req.token=token;
  req.user = user;

  next();
})
//유저 있으면 okey

//없으면 no
}

module.exports ={auth};