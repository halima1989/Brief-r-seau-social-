const express = require("express");
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
const {  connect  } = require('./Services/dbConnexion')
const router = require('./Controllers/routes/myRoutes');
const path = require('path')
require("dotenv").config();
const uploadsDir = path.join(__dirname, '/uploads');
app.use(express.static(uploadsDir));


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


connect(process.env.DB_URL, (error) => {
    if (error) {
        console.log('Failed to connect')
        process.exit(-1)
    } else {
        console.log('successfully connected')
    }
})


connect("mongodb://localhost:27017/", (error) =>{
    if(error){
        console.log("Failed to connect")
        process.exit(-1)
    }else{
        console.log("successfully connected");
        
    }
})




app.use("/", router);
app.listen(process.env.PORT, () => {
  console.log("im listening on port", process.env.PORT)
});