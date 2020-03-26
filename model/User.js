const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type:String,
    maxlength:50
  },
  email:{
    type:String,
    trim:true,
    unique:1
  },
  password:{
    type:String,
    minlength:5
  },
  lastname:{
    type:String,
    maxlength:50
  },
  role:{
    type:Number,
    default: 0
  },
  image:String,
  token:{
    type:String,
  },
  tokenExp:{
    type:Number
  }
})

userSchema.pre('save', function(next){
  //bcrypt 비밀번호 암호화
  var user =this;

  if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err, salt){
          if(err) return next(err)
          bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err)
            user.password = hash
            next()
          })
        })
  }else{
    next()
  }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
  //plainpassword 데이터베이스 암호 비교
  bcrypt.compare(plainPassword, this.password, function(err, isMatch){
    if(err) return cb(err)
    cb(null, isMatch)
  });
}

userSchema.methods.generatorToken=function(cb){
  //jsonwebtoken 생성
  var user=this;

  var token = jwt.sign(user._id.toHexString(),'secretToken');
  user.token = token;
  user.save(function(err, user){
    if(err) return cb(err)
    cb(null, user);
  })
  //user._id+'secretToken' = token
}

userSchema.statics.findByToken = function(token, cb){
  var user=this;

  jwt.verify(token,'secretToken', function(err, decoded){
    //userid로 토큰찾아서 클라이언트 토큰과일치여부 확인
    user.findOne({"_id":decoded, "token":token},function(err,cb){
      if(err ) return cb(err);
      cb(null, user);
    })
  });
}
const User = mongoose.model("User", userSchema);

module.exports={User}