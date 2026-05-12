const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const storage = multer.diskStorage({

  destination: function(req, file, cb){
    cb(null, "uploads/");
  },

  filename: function(req, file, cb){

    cb(
      null,
      Date.now() +
      path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage: storage
});

app.post(
  "/submit-complaint",
  upload.single("image"),

  (req, res) => {

    const complaints =
    JSON.parse(
      fs.readFileSync(
        "complaints.json"
      )
    );

    const newComplaint = {

      id: Date.now(),

      name: req.body.name,

      email: req.body.email,

      complaintType:
      req.body.complaintType,

      complaintDetails:
      req.body.complaintDetails,

      location:
      req.body.location,

      image:
      req.file
      ? req.file.filename
      : "",

      createdAt:
      new Date()
    };

    complaints.push(newComplaint);

    fs.writeFileSync(
      "complaints.json",
      JSON.stringify(
        complaints,
        null,
        2
      )
    );

    res.json({
      success: true,
      message:
      "Complaint Submitted Successfully"
    });
  }
);

app.get("/complaints", (req, res) => {

  const complaints =
  JSON.parse(
    fs.readFileSync(
      "complaints.json"
    )
  );

  res.json(complaints);
});
app.post("/signup", (req, res) => {

  const users =
  JSON.parse(
    fs.readFileSync(
      "users.json"
    )
  );

  const {
    name,
    email,
    password
  } = req.body;

  const userExists =
  users.find(
    user => user.email === email
  );

  if(userExists){

    return res.json({
      success: false,
      message:
      "User already exists"
    });
  }

  const newUser = {

    id: Date.now(),

    name,
    email,
    password
  };

  users.push(newUser);

  fs.writeFileSync(
    "users.json",

    JSON.stringify(
      users,
      null,
      2
    )
  );

  res.json({
    success: true,
    message:
    "Signup Successful"
  });
});
app.post("/login", (req, res) => {

  const users =
  JSON.parse(
    fs.readFileSync(
      "users.json"
    )
  );

  const {
    email,
    password
  } = req.body;

  const user =
  users.find(
    u =>
    u.email === email &&
    u.password === password
  );

  if(user){

    res.json({
      success: true,
      message:
      "Login Successful",

      user
    });

  }else{

    res.json({
      success: false,
      message:
      "Invalid Email or Password"
    });
  }
});

app.post(
  "/qr-complaint",

  (req, res) => {

    const complaints =
    JSON.parse(
      fs.readFileSync(
        "complaints.json"
      )
    );

    const newComplaint = {

      id: Date.now(),

      dustbinId:
      req.body.dustbinId,

      complaintType:
      req.body.complaintType,

      complaintDetails:
      req.body.complaintDetails,

      location:
      req.body.location,

      status:
      "URGENT",

      alert:
      "Municipal Office Notified",

      createdAt:
      new Date()
    };

    complaints.push(
      newComplaint
    );

    fs.writeFileSync(

      "complaints.json",

      JSON.stringify(
        complaints,
        null,
        2
      )
    );

    console.log(`
⚠ MUNICIPAL ALERT

Dustbin ID:
${req.body.dustbinId}

Location:
${req.body.location}

Action Required:
Garbage Overflow
`);

    res.json({

      success:true,

      message:
      "QR Complaint Registered"
    });
  }
);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});