
const express = require('express');
const cors = require('cors');

const app = express()
const port = process.env.PORT || 5000

// Mongo DB Importer
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
// Mongo DB Importer

// Middle Ware

app.use(cors())
app.use(express.json())



// MongoDB Start

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m3soc9n.mongodb.net/?retryWrites=true&w=majority`;

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

    // Service Database 
    const serviveCollection = client.db('carDoctor').collection('services')

    // Booking Database
    const bookingCollection = client.db('carDoctor').collection('booking')


    // Service Start  
    app.get('/services', async(req,res) => {
        const cursor = serviveCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })
    // Service End  



    // Booking Start  {{{{{{  POST  }}}}}}
    app.post('/booking', async (req, res) => {
        const booking = req.body
        console.log(booking);

        const result = await bookingCollection.insertOne(booking)
        res.send(result)
    })
    // Booking End   {{{{{{  POST  }}}}}}


    // Booking Data Get Start {{{{{{{   Get   }}}}}}}

    app.get('/booking', async(req, res) => {
        const cursor = bookingCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    // Booking Data Get End {{{{{{{   Get   }}}}}}}




    // Load Service Data Start  {{{{{{{     FIND ONE      }}}}}}}
    app.get('/services/:id', async(req, res) => {
        const id = req.params.id; 
        const query = {_id: new ObjectId(id)}
        // Options Start

        const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: { title: 1, service_id: 1, img: 1, price: 1 },
          };

        // Options End
        const result = await serviveCollection.findOne(query, options)
        res.send(result)
    })
    // Load Service Data End  {{{{{{{     FIND ONE      }}}}}}}
    



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// MongoDB End





app.get('/', (req, res) => {
    res.send('Doctor is running')
})

app.listen(port, ()=> {
    console.log(`Car doctor server is running on ${port}`);
})

