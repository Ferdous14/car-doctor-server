const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app = express();
const port = process.env.port || 5000;
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rpql26r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        const serviceCollection = client.db('carDoctor').collection('services');
        const bookingCollection = client.db('carDoctor').collection('bookings');


        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: { title: 1, service_id: 1, price: 1, img: 1 },
            };
            const result = await serviceCollection.findOne(query, options);
            res.send(result)
        })


        // bookings
        
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const result = await bookingCollection.insertOne(bookings);
            res.send(result)
        })
        
        
        app.get('/bookings', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email };
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result)
        })

        app.patch('/bookings/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id : new ObjectId(id)};
            const updatedBooking = req.body;
            const updateDoc = {
                $set: {
                  status: updatedBooking.status
                },
              };
              const result = await bookingCollection.updateOne(query, updateDoc);
              res.send(result)
        })

        app.delete('/bookings/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id : new ObjectId(id)}
            const result = await bookingCollection.deleteOne(query);
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
    res.send('Car doctor is running')
})

app.listen(port, () => {
    console.log(`'car dr is running on' ${port}`);
})