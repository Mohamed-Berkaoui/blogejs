const express = require("express");
const path = require("path");
require("dotenv").config();
const { connectToDb, getCollections } = require("./utils/dbConnection");
const { ObjectId } = require("mongodb");
const app = express();
app.use(express.static(path.join(__dirname, "styles")));
app.use(express.urlencoded({ extended: true }));

app.get("/", async function (req, res, next) {
  try {
    const publications = await getCollections()
      .publicationsCollection.find()
      .toArray();
    if (publications.length == 0) {
      throw { message: "no publications" };
    }
    res.render("index.ejs", { publications });
  } catch (e) {
    next(e);
  }
});

app.get("/addpost", (req, res, next) => {
  try {
    res.render("addpub.ejs");
  } catch (error) {
    next(error);
  }
});

app.post("/addpost", async function (req, res, next) {
  try {
    const post = { ...req.body, comments: [] };
    const newpost = await getCollections().publicationsCollection.insertOne(
      post
    );
    if (newpost.insertedId < 1) throw new Error("insertion went wrong");
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.get("/pub/:id", async function (req, res) {
  const pub = await getCollections().publicationsCollection.findOne({
    _id: new ObjectId(req.params.id),
  });
  var comments = [];
  for (let i = 0; i < pub.comments.length; i++) {
    const comment = await getCollections().commentsCollection.findOne({
      _id: new ObjectId(pub.comments[i]),
    });
    comments.push(comment);
  }
  res.render("publication.ejs", { pub, comments });
});

app.post("/addcomment/:postid", async (req, res, next) => {
  const comment = req.body;
  const newcomm = await getCollections().commentsCollection.insertOne(req.body);

  const updatedPost = await getCollections().publicationsCollection.updateOne({
    _id: new ObjectId(req.params.postid),
  },
  {$push:{comments:newcomm.insertedId}}
);
console.log(updatedPost)
res.redirect('/')
});

//error handler
app.use((error, req, res, next) => {
  res.send(error.message);
});

connectToDb().then(() => app.listen(8000, () => console.log("running")));
