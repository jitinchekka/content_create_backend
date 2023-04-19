// POST /my-collection - Create a new document
// GET /my-collection - Retrieve all documents
// GET /my-collection/:id - Retrieve a single document by ID
// PATCH /my-collection/:id - Update a document by ID
// DELETE /my-collection/:id - Delete a document by ID
const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const uri= "mongodb+srv://jitinchekka2:tsdG1S4YqB2tbQEq@cluster0.cdnvlxs.mongodb.net/?retryWrites=true&w=majority";
// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   } 
// }
// run().catch(console.dir);
const mongoose = require('mongoose');
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// If connection is successful
mongoose.connection.on('connected', () => {
  console.log('Connected to database mongodb @ 27017');
});
// If connection is not successful, then print the error
mongoose.connection.on('error', (err) => {
  if (err) {
    console.log('Error in database connection: ' + err);
  }
});

// Define a schema for your data
const mySchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true // Ensure the id field is unique
  },
  remaining: {
    type: Number,
    default: 10 // Set a default value for the remaining field
  },
  prompts: [
    {
      tags: [String],
      heading: {
        type: String,
        required: true
      },
      bodyText: {
        type: String,
        required: true
      }
    }
  ]
  
});

// Create a model based on your schema
const MyModel = mongoose.model('MyModel', mySchema);

// CRUD operations

// Create a new document
app.post('/my-collection', (req, res) => {
  const newDoc = new MyModel({
    id: req.body.id,
    remaining: req.body.remaining
  });

  newDoc.save()
  .then((doc) => {
    res.status(201).json(doc);
  })
  .catch((err) => {
    res.status(500).json({ error: err.message });
  });
});

// Retrieve all documents
app.get('/my-collection', (req, res) => {
  MyModel.find()
  .then((docs) => {
    res.status(200).json(docs);
  })
  .catch((err) => {
    res.status(500).json({ error: err.message });
  });
});

// Retrieve a single document by ID
app.get('/my-collection/:id', (req, res) => {
  MyModel.findOne({ id: req.params.id })
  .then((doc) => {
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
    } else {
      res.status(200).json(doc);
    }
  })
  .catch((err) => {
    res.status(500).json({ error: err.message });
  });
});

// Update a document by ID
app.patch('/my-collection/:id', (req, res) => {
  MyModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }) // { new: true } returns the updated document
  .then((doc) => {
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
    } else {
      res.status(200).json(doc);
    }
  })
  .catch((err) => {
    res.status(500).json({ error: err.message });
  });
});

// Delete a document by ID
app.delete('/my-collection/:id', (req, res) => {
  MyModel.findOneAndDelete({ id: req.params.id })
  .then((doc) => {
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
    } else {
      res.status(204).json();
    }
  })
  .catch((err) => {
    res.status(500).json({ error: err.message });
  });
});
//  handling prompts
app.post('/prompts', async (req, res) => {
  const { id, tags, heading, bodyText } = req.body;
  try {
    const result = await mySchema.findOneAndUpdate(
      { id },
      { $push: { prompts: { tags, heading, bodyText } } },
      { new: true }
    );
    res.json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.put('/prompts/:id', async (req, res) => {
  const { id } = req.params;
  const { tags, heading, bodyText } = req.body;
  try {
    const result = await mySchema.findOneAndUpdate(
      { id, 'prompts._id': req.body._id },
      {
        $set: {
          'prompts.$.tags': tags,
          'prompts.$.heading': heading,
          'prompts.$.bodyText': bodyText,
        },
      },
      { new: true }
    );
    res.json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.put('/prompts/:id', async (req, res) => {
  const { id } = req.params;
  const { tags, heading, bodyText } = req.body;
  try {
    const result = await mySchema.findOneAndUpdate(
      { id, 'prompts._id': req.body._id },
      {
        $set: {
          'prompts.$.tags': tags,
          'prompts.$.heading': heading,
          'prompts.$.bodyText': bodyText,
        },
      },
      { new: true }
    );
    res.json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.delete('/prompts/:id', async (req, res) => {
  const { id } = req.params;
  const { promptId } = req.body;
  try {
    const result = await mySchema.findOneAndUpdate(
      { id },
      { $pull: { prompts: { _id: promptId } } },
      { new: true }
    );
    res.json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});