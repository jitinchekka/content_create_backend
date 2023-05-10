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


const mongoose = require('mongoose');
// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// // If connection is successful
// mongoose.connection.on('connected', () => {
//   console.log('Connected to database mongodb @ 27017');
// });
// // If connection is not successful, then print the error
// mongoose.connection.on('error', (err) => {
//   if (err) {
//     console.log('Error in database connection: ' + err);
//   }
// });

async function connectToDatabase() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to the MongoDB database');
  } catch (err) {
    console.error('Error connecting to the MongoDB database:', err);
  }
}

connectToDatabase();

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
      // add industry field
      industry: {
        type: String,
        required: true
      },
      type_of_post: {
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

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the home page!');
  // If connection is successful
  // mongoose.connection.on('connected', () => {
  // });
  // If connection is not successful, then print the error
  mongoose.connection.on('error', (err) => {
    if (err) {
      res.send('Error in database connection: ' + err);
    }
  });
});

// CRUD operations

// Create a new document
app.post('/my-collection', (req, res) => {
  const newDoc = new MyModel({
    id: req.body.id,
    remaining: req.body.remaining,
    // prompts to null
    prompts: null
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
// req.body = { id: 'jitin@gmail.com', tags: ['tag1', 'tag2'], heading: 'Heading', industry:"education", bodyText: 'Body text' }
app.post('/prompts', async (req, res) => {
  const { id, tags, heading, industry, type_of_post,bodyText } = req.body;
  try {
    const result = await MyModel.findOneAndUpdate(
      { id }, // Find a document with that id
      { $push: { prompts: { tags, heading, industry,type_of_post, bodyText } } }, // Append data to prompts array
      { new: true }
    );
    console.log("result", result)
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
//Example of a request body
// {
//   "id": "123",
//   "tags": ["tag1", "tag2"],
//   "heading": "Heading",
//   "bodyText": "Body text"
// }
app.put('/prompts/:id', async (req, res) => {
  const { id } = req.params;
  const { tags, heading, bodyText, industry } = req.body;

  try {
    const prompt = { tags, heading, bodyText, industry };
    const result = await MyModel.findOneAndUpdate(
      { id },
      { $push: { prompts: prompt } },
      { new: true }
    );
    res.json(result);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});


app.delete('/prompts/:id', async (req, res) => {
  const { id } = req.params;
  const { promptId } = req.body;
  try {
    const result = await MyModel.findOneAndUpdate(
      { id },
      { $pull: { prompts: { _id: promptId } } },
      { new: true }
    );
    res.json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get prompts by id
app.get('/prompts/:id', async (req, res) => {
  console.log("Get prompts by id")
  const { id } = req.params;
  try {
    // get all prompts for a given id
    const promts = await MyModel.findOne({ id }, { prompts: 1, _id: 0 }); // { prompts: 1, _id: 0 } is a MongoDB projection that returns only the prompts field and excludes the _id field
    res.json(promts);
    console.log("prompts",promts);
  } catch (error) {
    // handle error
    res.send(error);
  }
});
// request format http://localhost:3000/prompts/123?tags=tag1,tag2
 
// get the most used 10 industries from the prompts
app.get('/industry', async (req, res) => {
  try {
    const result = await MyModel.aggregate([
      { $unwind: '$prompts' },
      { $group: { _id: '$prompts.industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(result);
  } catch (error) {
    res.send(error);
  }
});

// get the 10 most used tags from the prompts
app.get('/tags', async (req, res) => {
  try {
    const result = await MyModel.aggregate([
      { $unwind: '$prompts' },
      { $unwind: '$prompts.tags' },
      { $group: { _id: '$prompts.tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    console.log("result",result);
    res.json(result);
  } catch (error) {
    console.log("error",error);
    res.status(500).send(error);
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});