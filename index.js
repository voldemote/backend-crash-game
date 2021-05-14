// Import and configure dotenv to enable use of environmental variable
const dotenv = require("dotenv");
dotenv.config();

// Import express
const express = require("express");

// Import mongoose to connect to Database
const mongoose = require("mongoose");

//Import cors
const cors = require('cors')

//Import websocket service
const websocketService = require("./services/websocket-service");

// Import middleware for jwt verification
const passport = require('passport');
require('./util/auth');

// Initialise server using express
const server = express();

// Giving server ability to parse json
server.use(express.json());
server.use(passport.initialize());
server.use(passport.session());

// Home Route
server.get("/", passport.authenticate('jwt',{session: false}), (req, res) => {
  res
    .status(200)
    .send({
      message: "Blockchain meets Prediction Markets made Simple. - Wallfair.",
    });
});

// Import Routes
const userRoute = require("./routes/users/users-routes");
const eventRoute = require("./routes/users/events-routes");
const streamRoute = require("./routes/users/stream-routes");
const secureUserRoute = require("./routes/users/secure-users-routes");

server.use(cors());

// Using Routes
server.use("/api/user", userRoute);
server.use("/api/event", passport.authenticate('jwt',{session: false}), eventRoute);
server.use("/api/stream", passport.authenticate('jwt',{session: false}), streamRoute);
server.use("/api/user", passport.authenticate('jwt',{session: false}), secureUserRoute);

// Connection to Database
mongoose
  .connect(process.env.DB_CONNECTION, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(async () => console.log("Connection to DB successfull"))
  .catch((err) => console.log(err.message));

websocketService.startServer();

// Let server run and listen
var app = server.listen(process.env.PORT || 8000, function () {
  var port = app.address().port;
  console.log(`API runs on port: ${port}`);
});

