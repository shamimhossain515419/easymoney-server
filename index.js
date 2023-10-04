const express = require('express')
const cors = require('cors')
const app = express();
var jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
app.use(cors())

app.use(express.json());


const verifyJWT = (req, res, next) => {
     const authorization = req.headers.authorization;
     if (!authorization) {
          return res.status(401).send({ error: true, message: 'unauthorized access' });
     }
     // bearer token
     const token = authorization.split(' ')[1];

     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
               return res.status(401).send({ error: true, message: 'unauthorized access' })
          }
          req.decoded = decoded;
          next();
     })
}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.dvvalm2.mongodb.net/?retryWrites=true&w=majority`




// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
     serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
     }
});


async function run() {
     const UsersCollection = client.db("Easymoney").collection("users");
     const VideoCollection = client.db("Easymoney").collection("video");
     const paymentCollection = client.db("Easymoney").collection("payment");
     await client.db("admin").command({ ping: 1 });
     console.log("Pinged your deployment. You successfully connected to MongoDB!");




     app.post('/jwt', (req, res) => {
          const user = req.body;
          const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10d' })

          res.send({ token })
     })


     app.get('/users', verifyJWT, async (req, res) => {

          const admin = await UsersCollection.findOne({ email: req.query.email })
          if (admin.role == "admin") {
               const result = await UsersCollection.find().toArray();
               res.send(result);
          }

     })

     app.post('/users', async (req, res) => {
          const body = req.body;

          const email = { email: body.email };
          const data = await UsersCollection.findOne(email);
          if (data) {
               return res.send("Email allReady user")
          }
          const result = await UsersCollection.insertOne(body);
          res.send(result);
     });

     app.delete('/users', verifyJWT, async (req, res) => {
          const query = { _id: new ObjectId(req.query.id) };
          const result = await UsersCollection.deleteOne(query);
          res.send(result)

     })


     app.get('/user', verifyJWT, async (req, res) => {
          const email = req.query?.email;
          const query = { email: email };
          const result = await UsersCollection.findOne(query);
          res.send(result);
     })


     app.put('/users/:email', verifyJWT, async (req, res) => {
          const Email = req.params.email;
          const id = req.query.id;

          const taka = req.body;


          const money = await UsersCollection.updateOne({ email: Email }, { $set: { money: taka?.taka } })

          if (money) {
               const result = await UsersCollection.updateOne(
                    { email: Email },
                    {
                         $pull: { 'video': { _id: id } }
                    },
               );
               res.send(result)
          }


     });

     // video related api 

     app.get('/videos', async (req, res) => {
          const result = await VideoCollection.find().toArray();
          res.send(result)
     })

     app.get('/videos/:id', async (req, res) => {
          const id = { _id: new ObjectId(req.params.id) }
          const result = await VideoCollection.findOne(id)
          res.send(result)
     })

     app.put('/user/update', verifyJWT, async (req, res) => {
          const query = { email: req?.query?.email };
          const data = req.body;
          const result = await UsersCollection.findOne(query);
          const updateUser = {
               $set: {
                    name: data.name ? data.name : result.name,
                    password: data.password ? data.password : result.password,
                    level: data.level ? data.level : result.level,
                    refar: data.refar ? data.refar : result.refar,
                    video: data.video ? data.video : result.video,
                    photo: data.photo ? data.photo : result.photo,
                    ret: data.ret ? data.ret : result.ret,
                    money: data.money ? data.money : result.money,
                    number: data.number ? data.number : result.number,
                    number: data.number ? data.number : result.number,
                    address: data.address ? data.address : result.address,
                    date: data.date ? data.date : result.date,
                    role: data.role ? data.role : result.role,
                    date: data.date,
               }
          }

          const Newuser = await UsersCollection.updateOne(query, updateUser);
          res.send(Newuser)





     })

     //  payment related api 

     app.post('/payment', verifyJWT, async (req, res) => {
          const body = req.body;
          const result = await paymentCollection.insertOne(body);
          res.send(result)
     })
     app.get('/payment', verifyJWT, async (req, res) => {
          const result = await paymentCollection.find().toArray();
          res.send(result)
     })

}

run().catch(console.dir);

app.get('/', function (req, res,) {
     res.send("hello world")
})

app.listen(port, () => {
     console.log(`Example app listening on port ${port}`)
})