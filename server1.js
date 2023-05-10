const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();
const paypal = require("./paypal_server.js");
const app = express();

const admin_uri =
  "mongodb+srv://jitinchekka2:tsdG1S4YqB2tbQEq@cluster0.cdnvlxs.mongodb.net/?retryWrites=true&w=majority";
// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const client = new MongoClient(admin_uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin_").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
const mongoose_admin = require("mongoose");
const e = require("express");
mongoose_admin.connect(admin_uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
// If connection is successful
mongoose_admin.connection.on("connected", () => {
	console.log("Connected to database mongodb @ 27017");
});
// If connection is not successful, then print the error
mongoose_admin.connection.on("error", (err) => {
	if (err) {
		console.log("Error in database connection: " + err);
	}
});

const admin_schema = new mongoose_admin.Schema({
  Industries: {
    type: [String], // Array of strings
    required: true,
  },
  type_of_post: {
    type: String,
    required: true,
  },
  target_audience: {
    type: String,
    required: true,
  },
  number_of_free_prompts: {
    type: Number,
    default: 10,
  },
});
const AdminModel = mongoose_admin.model("admin", admin_schema);
// Create Endpoint: POST /admin
// Read Endpoint: GET /admin/:id
// Update Endpoint: PUT /admin/:id
// Delete Endpoint: DELETE /admin/:id
app.post("/admin", (req, res) => {
	console.log(req.body);
  const { Industries, type_of_post, target_audience, number_of_free_prompts } =
    req.body;
  const adminData = {
    Industries,
    type_of_post,
    target_audience,
    number_of_free_prompts,
  };

  AdminModel.create(adminData)
    .then((admin) => {
      res.status(201).json(admin);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});
// Retrieve all admin data
app.get("/admin", (req, res) => {
  AdminModel.find()
    .then((admins) => {
      res.status(200).json(admins);
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to retrieve admin data" });
    });
});
app.get("/admin/:id", (req, res) => {
  const adminId = req.params.id;

  AdminModel.findById(adminId)
    .then((admin) => {
      if (!admin) {
        res.status(404).json({ error: "Admin document not found" });
      } else {
        res.json(admin);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to retrieve admin document" });
    });
});
app.put("/admin/:id", (req, res) => {
  const adminId = req.params.id;
  const { Industries, type_of_post, target_audience, number_of_free_prompts } =
    req.body;
	console.log(req.body);
  AdminModel.findByIdAndUpdate(
    adminId,
    {
      Industries,
      type_of_post,
      target_audience,
      number_of_free_prompts,
    },
    { new: true }
  )
    .then((admin) => {
      if (!admin) {
        res.status(404).json({ error: "Admin document not found" });
      } else {
        res.json(admin);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to update admin document" });
    });
});
app.delete("/admin/:id", (req, res) => {
  const adminId = req.params.id;

  AdminModel.findByIdAndDelete(adminId)
    .then((admin) => {
      if (!admin) {
        res.status(404).json({ error: "Admin document not found" });
      } else {
        res.json({ message: "Admin document deleted successfully" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to delete admin document" });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
