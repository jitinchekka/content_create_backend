const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost/social-media-posts", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Define the Post model schema
const PostSchema = new mongoose.Schema({
  text: String,
  tags: [String],
});

// Create the Post model
const Post = mongoose.model("Post", PostSchema);

// Define the routes
app.get("/posts", (req, res) => {
  Post.find()
    .then((posts) => res.json(posts))
    .catch((err) => res.status(400).json("Error: " + err));
});

app.post("/posts", (req, res) => {
  const newPost = new Post({
    text: req.body.text,
    tags: req.body.tags,
  });

  newPost
    .save()
    .then(() => res.json("Post added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

app.delete("/posts/:id", (req, res) => {
  Post.findByIdAndDelete(req.params.id)
    .then(() => res.json("Post deleted."))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Endpoint to get the count of each tag
app.get("/tags", async (req, res) => {
  try {
    const tagCount = await Post.aggregate([
      {
        $unwind: "$tags", // split the tags array into multiple documents
      },
      {
        $group: {
          // group the documents by tag and count the occurrences of each tag
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
    ]);
    res.send(tagCount);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server started on port 5000");
});
