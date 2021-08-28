const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Create a new app & define its port or take it from the environment variables
// in case of deployment.
const app = express();
const port = process.env.PORT || 8999;

//DB config
const mongo_connectionURI =
  "mongodb+srv://madel96:qjbt4zuNzh47EgW@guestbook.csxxl.mongodb.net/guestbookDB?retryWrites=true&w=majority";
const mongo_options = {
  useNewUrlParser: true,
  //   useCreateIndex: true,
  useUnifiedTopology: true,
  //   auto_reconnect: true,
};

//Connect to the database
mongoose
  .connect(mongo_connectionURI, mongo_options)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log("Atlas not responding"));

const db = mongoose.connection;

//Reconnect to database if connection lost.
db.on("error", (err) => {
  console.log(err);
  mongoose.connect(mongo_connectionURI, mongo_options);
});

//Middlewares
app.use(bodyParser.json());

// app.use(cors());

//Only for testing purposes, don't do that in production.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

//Body Parser
app.use(express.urlencoded({ extended: false }));

app.use("/users", require("./Routes/UsersRoute.js"));

//Start the server listening on the above determined port.
app.listen(port, () => console.log(`Server running locally on port: ${port}`));
