var express = require('express');
var router = express.Router();

//引入crypto模块
var md5=require("crypto");

//引入数据库
var mysql=require('mysql');
//链接数据库
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'smms'
});
//打开数据库连接
connection.connect();



/*添加用户的路由*/
router.post('/add', function (req, res, next) {
  //2.后端路由接收前端数据
  let {username,pass,region}=req.body;

  //对密码进行md5加密
  pass=md5.createHash("md5").update(pass).digest("hex");

  //3.连接数据库，把数据写入数据库
  //定义sql语句
  let sqlStr="insert into userTable(userName,userPwd,userGroup) values(?,?,?)";
  //参数数组
  let sqlParams=[username,pass,region];

  
  //执行sql
  connection.query(sqlStr,sqlParams,function (error,results) {
    if (error) throw error; //出错对象
    //根据执行sql语句的结果返回json给前端
 
    if(results.affectedRows>0){
      res.send({"isOk":true,"msg":"账号添加成功!"})
    }else{
      res.send({"isOk":false,"msg":"账号添加失败!"})
    }
    
  });
});

//获取用户列表路由
router.get('/list',(req,res)=>{
  //1.构造sql语句
  let sqlStr="select * from usertable order by u_id DESC";
  //2.执行sql语句
  connection.query(sqlStr,function(err,userlist){
    //出错后的代码不执行，抛出
    if(err)throw err;
    //3.返回查询的结果到前端页面显示（对象数组）
    res.send(userlist)
  })
});

//删除用户的路由
router.get('/del',(req,res)=>{
  //后端接收id,然后返回给前端
  let userid=req.query.id;
  //构造sql语句
  let sqlStr="delete from usertable where u_id=?";
  let sqlParams=[userid];
  //并且执行删除sql
  connection.query(sqlStr,sqlParams,(error,result)=>{
     if(error)throw error;
     //"affectedRows":1,返回受影响的行数，如果大于0就代表成功
     if(result.affectedRows>0){
      res.send({"isOk":true,"msg":"账号删除成功!"})
    }else{
      res.send({"isOk":false,"msg":"账号删除失败!"})
    }
  });
});

//根据id获取用户数据的路由
router.get('/getUserByID',(req,res)=>{
   //1.接受用户id
   let id=req.query.id;
  //2.构造sql语句
  let sqlStr="select * from usertable where u_id=?";
  let sqlParams=[id];
  //3.执行sql语句
  connection.query(sqlStr,sqlParams,function(err,userData){
    //出错后的代码不执行，抛出
    if(err)throw err;
    //4.返回查询的结果到前端页面显示（对象数组）
    res.send(userData)
  })
});

//接受新的数据并且把新的数据update到数据库中
router.post('/save', function (req, res, next) {
  //2.后端路由接收前端数据
  let {pass,username,region,u_id,oldPwd}=req.body;

  //对新的密码和以前的密码进行比较，如果不相等就说明已经修改，对新密码进行md5加密，
  // 然后在赋予它
  if(oldPwd!=pass){
    pass=md5.createHash("md5").update(pass).digest("hex");
  };
  
  //3.连接数据库，把数据写入数据库
  //定义sql语句
  let sqlStr="update usertable set userName=?,userPwd=?,userGroup=? where u_id=?";
  //参数数组
  let sqlParams=[username,pass,region,u_id];
  //执行sql语句
  connection.query(sqlStr,sqlParams,function (error,results) {
    if (error) throw error; //出错对象
    //根据执行sql语句的结果返回json给前端
    if(results.affectedRows>0){
      res.send({"isOk":true,"msg":"账号修改成功!"})
    }else{
      res.send({"isOk":false,"msg":"账号修改失败!"})
    }
  });
});




module.exports = router;
