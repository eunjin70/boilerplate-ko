const express = require("express");
const app =express();
const port =3000;

const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require("./config/key");
const {auth} = require("./middleware/auth");
const {User} = require("./model/User");

//application/x-www.form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());
mongoose.connect(config.mongoURI,{
  useNewUrlParser:true, useUnifiedTopology:true,useCreateIndex:true, useFindAndModify:false
}).then(()=>console.log("MongoDb Connected..."))
.catch(err=>console.log(err));



app.get('/',(req, res)=>res.send('Hello Express! ...'));

app.post('/api/users/register',(req, res)=>{
  //회원가입 정보 처리
  const user = new User(req.body);

  user.save((err, userInfo)=>{
    if(err) return res.json({success:false, err})
    return res.status(200).json({success:true})
  });

})

app.post('/api/users/login', (req, res)=>{
  //요청된 이메일 있는지 확인
    User.findOne({email:req.body.email}, function(err, user){
      console.log("user : ===>" +user);
      if(!user){
        return res.json({
          loginSuccess : false,
          message:"존재하지 않는 사용자"
        })
      }
   //요청된 이메일의 비밀번호 비교
      user.comparePassword(req.body.password, (err,isMatch )=>{
        if(!isMatch)
          return res.json({loginSuccess:false, message:"id password 확인"});
        //비밀번호 일치하면 token 생성
        user.generatorToken((err, user)=>{
          if(err) return res.status(400).send(err);

          //token 저장 - cookie,session localstorage etc.
          res.cookie("x_auth",user.token)
          .status(200)
            .json({loginSuccess:true, userId:user._id});

        });
      })


    })
  
})

app.get('/api/users/auth', auth, (req,res)=>{
    //middleware 통과 ->authentication true
    res.status(200).json({
      _id:req.user._id,
      isAdmin : req.user.role === 0?false : true,
      isAuth:true,
      email:req.user.email,
      name:req.user.name,
      lastname:req.user.lastname,
      role:req.user.role,
      image:req.user.image
    })
})

//auth middleware에서 user setting
app.get('/api/users/logout', auth, (req, res)=>{
  User.findOneAndUpdate({_id:req.user._id}, {token:""}, (err, user)=>{
    if(err) return res.json({success:false, err:true});

    return res.status(200).send({
      success:true
    })
  }); 
})

app.listen(port, ()=>console.log(`Example listening on port ${port}`));