const express = require("express");
const router = express.Router();
const Users = require("../Models/User");
const bcrypt = require("bcrypt");

// Separate API to get the total users count if needed, however the total will be returned as a key also on others
// APIs below which are feching either or users or searching for some of them.

router.get("/count", (req, res) => {
  Users.countDocuments({}, function (err, count) {
    if (err) {
      console.log(err);
      res.status(500).send("Count not be retrieved");
    } else {
      res.status(200).json(count);
    }
  });
});

//Create a new user
router.post("/add", (req, res) => {
  const newUser = req.body;
  console.log(newUser);

  Users.findOne({ $or: [{ email: newUser.email }] }, (err, user) => {
    if (err) throw err;
    else if (user) {
      res.status(403).json({ email: "Email already exists" });
    } else {
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          //   if(Users.find({password: hash}))
          console.log(Users.find({ password: hash }));
          newUser.password = hash;

          console.log(`Hashed password: ${newUser.password}`);

          Users.create(newUser, (err, data) => {
            if (err) {
              res.status(500).send("Error");
            } else {
              res.status(201).send("New user created successfully");
            }
          });
        })
      );
    }
  });
});

//Authenticate user
router.post("/login", (req, res) => {
  const userData = req.body;

  Users.findOne({ email: userData.email }, (err, user) => {
    if (err) throw err;
    else if (!user) {
      res.status(401).send("User not found");
    } else {
      bcrypt.compare(userData.password, user.password, (err, isMatched) => {
        if (err) {
          console.log("Error");
          res.status(500).send("Login failed");
          throw err;
        }
        if (isMatched) {
          console.log("Logged In");
          res
            .status(201)
            .send({ message: "Logged In successfully", data: user });
        } else {
          console.log("Failed");
          res.status(401).send("Wrong Password");
        }
      });
    }
  });
});

// The two APIs below have the server-side pagination & sorting applied

//Search for specific users

router.get("/filter", (req, res) => {
  const columnToFilter = req.query.column || "first_name";
  const dataToMatch = req.query.searchValue || "";
  const recordsPerPage = parseInt(req.query.recordsPerPage) || 10;
  const currentTablePage = parseInt(req.query.pageNumber) || 0;
  const orderAscOrDec = req.query.order || "asc";
  const columnToOrderBy = req.query.orderBy || "_id";

  console.log(req.query);
  console.log(dataToMatch);
  console.log(recordsPerPage);
  console.log(currentTablePage);

  Users.find({ [columnToFilter]: { $regex: `^${dataToMatch}` } })
    .sort({ [columnToOrderBy]: orderAscOrDec })
    .limit(recordsPerPage)
    .exec((err, users) => {
      if (err) {
        res.status(500).send("Not Filtered");
      } else {
        console.log(users?.length);
        res.json({ data: users, totalCount: users?.length || 0 });
      }
    });
});

//Get all users

router.get("/", (req, res) => {
  const recordsPerPage = parseInt(req.query.recordsPerPage) || 10;
  const currentTablePage = parseInt(req.query.pageNumber) || 0;
  const orderAscOrDec = req.query.order || "asc";
  const columnToOrderBy = req.query.orderBy || "_id";

  let totalCount;

  Users.find({})
    .sort({ [columnToOrderBy]: orderAscOrDec })
    .skip(recordsPerPage * currentTablePage)
    .limit(recordsPerPage)
    .exec((err, users) => {
      if (err) {
        res.status(500).send("Pagination Failed");
      } else {
        console.log(users);
        res.json({ data: users, totalCount: users?.length || 0 });
      }
    });
});

//Edit current user

router.put("/:id", (req, res) => {
  let userToEdit = req.params.id;
  const newUser = req.body;
  console.log(newUser);

  Users.findOneAndUpdate(
    { _id: userToEdit },
    newUser,
    { upsert: true },
    function (err, users) {
      if (err) {
        res.status(500).send("Edit Failed");
      } else {
        res.status(201).send("User Edited Successfully!");
      }
    }
  );
});

//Delete user

router.delete("/:id", (req, res) => {
  const userToDelete = req.params.id;

  Users.deleteOne({ _id: userToDelete }, (err, data) => {
    if (err) {
      res.status(500).send("Delete Failed");
    } else {
      res.send("User Deleted");
    }
  });
});

module.exports = router;
