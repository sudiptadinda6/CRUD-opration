const express=require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
const multer=require('multer')
const { name } = require('ejs')
app.set('view engine', 'ejs')
//app.use( express.static( "upload" ) );
app.use(express.urlencoded({extended:true}))
app.use(express.json())
//database conection 
const conectiondatabase= async()=>{
    try {
        await mongoose.set('strictQuery', false);
        await mongoose.connect('mongodb://127.0.0.1:27017/studentregistration')  
      console.log(`datadabse conection successfully `) 
 
     } catch (error) {
         console.log(`datadabse not conection successfully `) 
         console.log(error.massage)
         process.exit(1)
     }
}
//sheama database
const databasesave= new mongoose.Schema({
    name:{type:String,required:[true,"name is must be reuired"]},
    address:{type:String,required:[true,"address is must be reuired"]},
    email:{type:String,required:[true,"email is must be reuired"]},
    password:{type:String,required:[true,"password is must be reuired"]},
    number:{type:String,required:[true,"number is must be reuired"]},
    gander:{type:String,required:[true,"gander is must be reuired"]},
    dagree:{type:String,required:[true,"dagree is must be reuired"]},
    language:{type:Array,required:[true,"language is must be reuired"]},
    file:{type:String,required:[true,"file is must be reuired"]},
    cerateddate:{type:Date,default:Date.now}
})
//database model conection
const modeldatasave= new mongoose.model("newsudentadd",databasesave)
const port =4000
//image and file save server
const storage = multer.diskStorage({
    destination: "upload/",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
  })

const upload = multer({ storage: storage }).single('image')
//home router
app.get('/',(req,res)=>{
    res.render('welcomepage',{})
})
// registration page get in server
app.get('/registration',(req,res)=>{
    res.render('newreg',{})
})
//register data send post to database
app.post('/registration',upload,async(req,res)=>{
    const user = await modeldatasave.findOne({email:req.body.email})

    if(user){
        res.send('eamil already exists')
    
    }
    const savestudentdata= new modeldatasave({
    name:req.body.name,
    address:req.body.address,
    email:req.body.email,
    password:req.body.password,
    number:req.body.number,
    gander:req.body.gander,
    dagree:req.body.dagree,
    language:req.body.language,
    file:req.file.filename
    })
    console.log(user)
    savestudentdata.save()
    res.render('sussefull',{})
})
//log in get request
app.get("/login",(req,res)=>{
    res.render('login',{})
})
//LOG IN AUTHENTICATION CHECKING 
app.post('/login',async(req,res)=>{
    try {
        const email=req.body.email
        const password=req.body.password
        const user = await modeldatasave.findOne({email:email})
        if(user && user.password===password){
            res.render('table',{name:user.name,address:user.address,email:user.email,number:user.number,
          gander:user.gander,dagree:user.dagree,language:user.language,file:user.file,nid:user._id})
        }else{
            res.send(`data not found`)
        }
        } 
        catch (error) {
        res.send(error.message)
        }
})
//queary parem updated
app.get('/update',async(req,res)=>{
    try {
        const id=req.query.id
        const user = await modeldatasave.findOne({_id:id})
        if(user){
            res.render('daseboard',{name:user.name,address:user.address,email:user.email,number:user.number,
          gander:user.gander,dagree:user.dagree,language:user.language,file:user.file,nid:user._id,id})
        }else{
            res.send(`data not found`)
        }
        } 
        catch (error) {
        res.send(error.message)
        }     
})
//updated user
app.post('/update',upload,async(req,res)=>{
    try {
        const newid=req.body.ida
    const user = await modeldatasave.findOne({_id:newid})
    if(req.file){
        user.name=req.body.name
        user.address=req.body.address
        user.email=req.body.email
        user.number=req.body.number
        user.gander=req.body.gander
        user.dagree=req.body.dagree
        user.language=req.body.language
        user.file=req.file.filename
        user.save()
    }else{
        user.name=req.body.name
        user.address=req.body.address
        user.email=req.body.email
        user.number=req.body.number
        user.gander=req.body.gander
        user.dagree=req.body.dagree
        user.language=req.body.language
        user.save() 
    }
    res.render('table',{name:user.name,address:user.address,email:user.email,number:user.number,
        gander:user.gander,dagree:user.dagree,language:user.language,file:user.file,nid:user._id})
    } catch (error) {
       res.send(error.message) 
    }   
})
//change password
app.get('/changepassword',(req,res,next)=>{
  try {
    const idc=req.query.id
    res.render('change',{idc})
  } catch (error) {
    res.send(error.message)
  }  
})
//change password updated
app.post('/changepassword',async(req,res)=>{
    try {
      const ids=req.body.ch
      const user = await modeldatasave.findOne({_id:ids})
      const oldp =req.body.password1
      const newp =req.body.password2
      const conp =req.body.password3
      if(oldp!=newp){
        if(newp==conp){
       if(user){
        user.password=conp
        user.save()
        res.redirect('/login')
       }
            
      }else{
        res.send(`conf password and new password are not same`)
      }

    }
        else{
            res.send(`old and newp pasword are  same`)
        }
      }  
    catch (error) {
      res.send(error.message)
    }  
  })
  //show database all value 
  app.get("/show",async(req,res)=>{
    try {
      const user= await modeldatasave.find({})
     res.render('display',{user})
    } catch (error) {
      res.send(`not found data`)
    }
  })
  //deleted database
  app.get('/deleted',async(req,res)=>{
try {
  const did=req.query.id
     const user=await modeldatasave.deleteOne({_id:did})
    res.render('deeted',{})
  
} catch (error) {
  res.send(`deleted not completed`)
}
  })
  //download
    app.get('/download', async(req, res)=>{
      const dis=req.query.id
      const user=await modeldatasave.findOne({_id:dis})
      if(!user){
      res.status(404).json({error:"user not found"})
      return
      }
      const file = `${__dirname}/upload/${user.file}`;
      res.download(file); // Set disposition and send it.
    });
//server is hosting
app.listen(port,async()=>{
    console.log(`server is running http://localhost:${port}`)
    //call this database conection
    await conectiondatabase()
})