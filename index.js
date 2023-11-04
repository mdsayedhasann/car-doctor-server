const express = require('express');
const cors = require('cors');

// JWT WEB TOKEN
const jwt = require('jsonwebtoken');
// JWT WEB TOKEN

const cookieParser = require('cookie-parser')

const app = express()
const port = process.env.PORT || 5000

// Mongo DB Importer
const {
  MongoClient,
  ServerApiVersion,
  ObjectId
} = require('mongodb');
require('dotenv').config()
// Mongo DB Importer

// Middle Ware

app.use(cors({
  // Transfer to Client Side Start
  origin: ['http://localhost:5173'],
  credentials: true
  // Transfer to Client Side End
}))
app.use(express.json())

// Backend e porar jonno Start 
app.use(cookieParser());
// Backend e porar jonno End



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


// nijeder banano middleware start
const logger = async (req, res, next) => {
  console.log('called', req.host, req.originalUrl);
  next()
}
// nijeder banano middleware End

//  Main Jinis, Middleware Verify Token Start 
const verifyToken = async (req, res, next) => {
  const token = req.cookie?.token
  console.log('Value of Token in Middleware', token);
  if (!token) {
    return res.status(401).send({
      message: 'Not Authorizes'
    })
  }
  // Verify Token Start 
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // error
    if(err){
      console.log(err);
      return res.status(401).send({message: 'Unauthorised'})
    }
    // Valid 
    console.log('Value in the TOKEN', decoded);
    req.user = decoded; 
    next()
  })
  // Verify Token End
  
}
//  Main Jinis, Middleware Verify Token End

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Service Database 
    const serviveCollection = client.db('carDoctor').collection('services')

    // Booking Database
    const bookingCollection = client.db('carDoctor').collection('booking')

    // Auth Related API Stared 
    app.post('/jwt', logger, async (req, res) => {
      const user = req.body
      console.log(user);


      // Token Generate Start 
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      })
      res
        .cookie('token', token, { // Cookie er Vitor set kora Start
          httpOnly: true,
          secure: false
        }) // Cookie er Vitor set kora End
        .send({
          success: true
        })

      // Token Generate End
    })
    // Auth Related API End 

    // Service Start  
    app.get('/services', logger, async (req, res) => {
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

    // app.get('/booking', async(req, res) => {
    //     const cursor = bookingCollection.find()
    //     const result = await cursor.toArray()
    //     res.send(result)
    // })

    // New Style 


    app.get('/booking', logger, verifyToken, async (req, res) => {
      console.log(req.query.email);
      console.log('user in the Valid token', req.user);
      // Test kora Cookie jaitase kina Start
      console.log('tok tok token', req.cookies.token);
      // Test kora Cookie jaitase kina End
      let query = {}
      if (req.query?.email) {
        query = {
          email: req.query.email
        }
      }

      const result = await bookingCollection.find(query).toArray()
      res.send(result)
    })

    // Booking Data Get End {{{{{{{   Get   }}}}}}}


    // Booking Data Delete Start   {{{{{{   DELETE   }}}}}}
    app.delete('/booking/:id', async (req, res) => {
      const id = req.params.id
      const query = {
        _id: new ObjectId(id)
      }
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
    })
    // Booking Data Delete End   {{{{{{   DELETE   }}}}}}




    // Load Service Data Start  {{{{{{{     FIND ONE      }}}}}}}
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id)
      }
      // Options Start

      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: {
          title: 1,
          service_id: 1,
          img: 1,
          price: 1,
          img: 1
        },
      };

      // Options End
      const result = await serviveCollection.findOne(query, options)
      res.send(result)
    })
    // Load Service Data End  {{{{{{{     FIND ONE      }}}}}}}




    // Send a ping to confirm a successful connection
    await client.db("admin").command({
      ping: 1
    });
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

app.listen(port, () => {
  console.log(`Car doctor server is running on ${port}`);
})