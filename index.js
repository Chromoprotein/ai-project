let express = require('express');
const cors = require('cors');
let bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const app = express();

require('./db')

app.use(cors({ 
    origin: 'http://localhost:3000', 
    credentials: true 
}));
app.use(cookieParser());

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));

app.use("/api/auth", require("./Auth/Route"))
app.use("/chats", require("./Chats/Route"))

let dotenv = require('dotenv');
dotenv.config();

let port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});