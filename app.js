const express=require('express');
let app=express();
let mongo=require('mongodb');
let port=process.env.PORT || 9700;
let dotenv=require('dotenv');
dotenv.config();
let MongoClient=mongo.MongoClient;
let bodyParser=require('body-parser');
let cors=require('cors');
let mongoUrl=process.env.mongoLiveUrl;
let db;
//database sample comment
let col_name="dashboard";
let swaggerUi=require('swagger-ui-express');
const swaggerDocument=require('./swagger.json');
let package=require('./package.json');

swaggerDocument.info.version=package.version;

//middleware
app.use(`/api-doc`,swaggerUi.serve,swaggerUi.setup(swaggerDocument));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

app.get('/health',(req,res)=>{
    res.status(200).send('Health check');
});

app.post('/addUser',(req,res)=>{
    db.collection(col_name).insertOne(req.body,(err,result)=>{
        if(err) throw err;
        res.send('Data Added')
    })
})

app.get('/getUser',(req,res)=>{
    let query={};
    if(req.query.role && req.query.city){
        query={role:req.query.role,city:req.query.city,isActive:true}
    }else if(req.query.city){
        query={city:req.query.city,isActive:true}
    }
    else if(req.query.role){
        query={role:req.query.role,isActive:true}
    }else if(req.query.isActive){
        let isActive = req.query.isActive;
        if(isActive == "false"){
            isActive = false
        }else{
            isActive = true
        }
        query={isActive}
    }
    else{
        query={isActive:true}
    }        

    db.collection(col_name).find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);    
    })
})
app.put('/updateUser',(req,res) => {
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set:{
                name:req.body.name,
                city:req.body.city,
                phone:req.body.phone,
                role:req.body.role,
                isActive:true
            }
        },(err,result) => {
            if(err) throw err;
            res.send('Data Updated')
        }
    )
})

// hard delete
app.delete('/deleteUser',(req,res) => {
    db.collection(col_name).remove(
        {_id:mongo.ObjectId(req.body._id)},(err,result) => {
            if(err) throw err;
            res.send('User Deleted')
        }
    )
})

//soft deactivate
app.put('/deactivateUser',(req,res) => {
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set:{
                isActive:false
            }
        },(err,result) => {
            if(err) throw err;
            res.send('User Deactivated')
        }
    )
})

//activate
app.put('/activateUser',(req,res) => {
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set:{
                isActive:true
            }
        },(err,result) => {
            if(err) throw err;
            res.send('User Activated')
        }
    )
})

app.get('/user/:id',(req,res) => {
    let id = mongo.ObjectId(req.params.id);
    db.collection(col_name).find({_id:id}).toArray((err,result) => {
        if(err) throw err;
        res.status(200).send(result)
    })
})


MongoClient.connect(mongoUrl,(err,client)=>{
    if(err) {console.log("Error while connecting");}

    db=client.db('test');
    
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    });
})