const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors({
    origin: ['http://localhost:5173'],
}))
app.use(express.json())
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dqtrbnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});





async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const serviceCollection = client.db('carDoctor').collection('services')
        const bookingsCollection = client.db('carDoctor').collection('bookings')


        // auth related api
        app.post('/jwt', async (req, res)=>{
            const user = req.body
            console.log(user)
            const token = jwt.sign(user, 'secret', {expiresIn: '1h'})
            res.send(token)
        })




        // Service related api
        app.get('/services',  async (req, res) => {
            const cursor = serviceCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })


        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const options = {
                
                // Include only the `title` and `imdb` fields in the returned document
                projection: { _id: 0, title: 1, price: 1, service_id: 1, img:1},
            };
            const result = await serviceCollection.findOne(query,options)
            res.send(result)
        })

        // bookings

        app.get('/bookings',  async(req, res)=>{
          
            // let query = {};
            // if(req.query?.email) {
            //     query = {email: req.query.email}
            // }
            const result = await bookingsCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/bookings', async(req, res)=>{
            const booing = req.body
            console.log(booing);
            const result = await bookingsCollection.insertOne(booing)
            res.send(result)
            
        })

        app.patch('/bookings/:id', async(req, res)=>{
            const id = req.params.id
            const updateBooking = req.body;
            const filter = {_id: new ObjectId(id)}
            console.log(updateBooking);
            const updateDoc = {
                $set: {
                    status: updateBooking.status
                },
              };
              const result = await bookingsCollection.updateOne(filter, updateDoc)
              res.send(result)

        })

        app.delete('/bookings/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await bookingsCollection.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('car doctor running')
})

app.listen(port, () => {
    console.log(`car doctor server is running port: ${port}`);
})