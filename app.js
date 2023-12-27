const express = require("express");
var morgan = require("morgan");
var cors = require("cors");
var fs = require("fs");
const exphbs = require("express-handlebars");
const session = require("express-session");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

// Session middleware
app.use(
    session({
        secret: "membership",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
    })
);
app.use(cors({ credentials: true, origin: true }));
app.enable("trust proxy", 1);
app.use(
    morgan("common", {
        stream: fs.createWriteStream("./access.log", { flags: "a" }),
    })
);

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files middleware
app.use(express.static("public"));

// Templating engine middleware
const handlebars = exphbs.create({ extname: ".hbs" });
app.engine(".hbs", handlebars.engine);
app.set("view engine", ".hbs");

// Routes
const routes = require("./server/routes/route");
app.use("/", routes);

app.listen(port, () => console.log(`Listening on port ${port}`));