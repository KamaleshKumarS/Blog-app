const express=require('express');
const bodyParser=require('body-parser');
const jwt=require('jsonwebtoken');
const cors=require('cors');
const app=express();
const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://kam:kam@cluster0.r6cmb.mongodb.net/?retryWrites=true&w=majority').then(val=>{
	console.log('mongodb connected')
})
const userSchema=new mongoose.Schema({
	username:String,
	password:String,
	post:Array,
})
const Quser=new mongoose.model('Quser',userSchema) 
app.use(express.json())
app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
const path = __dirname + '/views/';
app.use(express.static(path));
app.post('/login',(req,res)=>{
	const username=req.body.username
	const password=req.body.Password
	Quser.findOne({username,password},(err,val)=>{
	if (val!=null){
		const token=generateAccessToken(String(val._id))
		res.json({auth:true,token,id:String(val._id)})
	}else{
		res.json({auth:false})
	}		
	})

})
app.post('/signup',(req,res)=>{
	const username=req.body.username
	const password=req.body.Password
	 Quser.findOne({username},(err,val)=>{
		console.log(val)
		if (val!=null){
			res.json({created:false,repeat:true})
		}else{
			const nuser1= new Quser({username,password})
			nuser1.save()
			const token=generateAccessToken(String(nuser1._id))
			res.json({created:true,token})
		}
	})
})
app.post('/home',async(req,res)=>{
	const token=req.body.token
	jwt.verify(token,'secretString',(err,val)=>{
		if(err){
			res.json({auth:false})
		}else{
			res.json({auth:true,id:val})
		}
	})
})
app.post('/post',(req,res)=>{
	const {id,text,key,date}=req.body
	Quser.updateOne({_id:id},
		{$push:{ 
		post:{text,key,date,publish:true} }
}).then((val)=>{
	Quser.findOne({_id:id},(err,val)=>{
		console.log(val)
		res.json({posted:true})
	})
})

})
app.post('/search',(req,res)=>{
	const username=req.body.Uname
	Quser.findOne({username},(err,val)=>{
		if(!val){
			res.json({found:false})
		}else{
			res.json({found:true,posts:val.post})
		}
	})
})
app.post('/userProfile',(req,res)=>{
	const id=req.body.id
	Quser.findOne({_id:id},(err,val)=>{
		res.json({post:val.post,name:val.username})
	})
})
app.post('/publish',(req,res)=>{
	const {id,status,key,date}=req.body
	Quser.findOneAndUpdate({_id:id,"post.key":key,"post.date":date},{"post.$.publish":!status}).then(val=>{
		console.log(val)
		res.json({change:true,Publish:!status})
	}).catch(err=>{
		res.json({change:false})
	})
})
app.listen(4000,()=>{
	console.log('server started on port 4000')
})

const generateAccessToken=(param)=>{
	const token=jwt.sign(param,'secretString')
	return token
}