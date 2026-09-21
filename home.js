import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
import express from 'express'
import path from 'path'
import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb'
const app=express()

app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:true}))
const publicpath=path.resolve('public')
app.use(express.static(publicpath))

// connectiong to db

const dbname='node-project'
const collection='todo'
const url=process.env.MONGO_URI
const client= new MongoClient(url)

const dbconnection=async ()=>{
    const connect=await client.connect()
    return await connect.db(dbname)
}

app.get('', (req, resp)=>{
    resp.render('home')
    
})


app.get('/tasklist', async(req, resp)=>{
    const db=await dbconnection()
    const collectionname=db.collection(collection)
    const result=await collectionname.find().toArray()
    resp.render('tasks', {result})
})

app.get('/add', (req, resp)=>{
    resp.render('add')
})

app.get('/update', (req, resp)=>{
    resp.render('update')
})

app.post('/submit', async(req, resp)=>{
    const db=await dbconnection()
    const collectionname=db.collection(collection)
    const result=await collectionname.insertOne(req.body)
    if(result){
        resp.redirect('/');
    }
    else{
        resp.redirect('/add')
    }
    
})
app.get('/delete/:id', async(req, resp)=>{
    const id=req.params.id;
    const db=await dbconnection()
    const collectionname=db.collection(collection)
    const result=await collectionname.deleteOne({_id: new ObjectId(id)})
    if(result){
        resp.redirect('/')
    }
    else{
        resp.redirect('/tasklist')
    }
})

app.get('/update/:id', async(req, resp)=>{
    const id=req.params.id;
    const db=await dbconnection()
    const collectionname=db.collection(collection)
    const result=await collectionname.findOne({_id: new ObjectId(id)})
    if(result){
        resp.render('update', {result})
    }
    else{
        resp.redirect('/tasklist')
    }
})
app.post('/update', async(req,resp)=>{
    const id=req.body.id
    const db=await dbconnection()
    const collectionname=db.collection(collection)
    const result=await collectionname.updateOne({_id: new ObjectId(id)}, { $set: { title: req.body.title, description: req.body.description}})
    console.log(result)
    if(result){
        resp.redirect('/tasklist')
    }
    else{
        resp.redirect('/update')
    }
})

app.post('/multipledelete', async(req, resp)=>{
    const ids=req.body.selectedcheckbox
    const db=await dbconnection()
    const collectionname=db.collection(collection)

    let allobjectids=undefined
    if(Array.isArray(ids)){
        allobjectids=req.body.selectedcheckbox.map((id)=>new ObjectId(id))
    }
    else{
        allobjectids=[new ObjectId(req.body.selectedcheckbox)]
    }
    
    const result=await collectionname.deleteMany({_id: { $in: allobjectids}})
    if(result){
        resp.redirect('/')
    }
    else{
        resp.redirect('/tasklist')
    }
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});