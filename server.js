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

app.listen(process.env.PORT || 3030,()=>{
	console.log('server started on port 3030')
})

const generateAccessToken=(param)=>{
	const token=jwt.sign(param,'secretString')
	return token
}