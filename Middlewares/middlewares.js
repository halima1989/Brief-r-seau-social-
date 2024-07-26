var validator = require("validator");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");


const verifDataUser = async (req, res, next) => {

    const { name,email,password} = req.body;
   
    if (!validator.isAlpha(name)) {
      return res.status(400).json({ message: "le nom doit contenir que des lettres." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "l'adresse mail n'est pas valide." });
    }
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: "le mot de passe n'est pas valide." });
    }
 
    next();
  };

  const extractToken = async (req) => {
    const tokenHeaders = req.headers.authorization;
  
    if (tokenHeaders !== undefined || tokenHeaders) {
      const bearer = tokenHeaders.split(" ");
      const token = bearer[1];
      return token;
    }
  };
  const verifyToken = async (req, res) => {
    const token = await extractToken(req);
    if (token === undefined || !token) {
      res.status(400).json({ error: "Bad request" });
      console.log(token);
      return;
    } else {
      return jwt.verify(token, process.env.SECRET_KEY, async (error, data) => {
        if (error) {
          // res.status(401).json({ error: "Unauthorized" });
          return;
        }
        next()

        return data;
      });
    }
  };
  
  const verifUserUpdate = async (req, res, next) => {
    
    const user_id = req.params.user_id;
    const {name, email, password, image} = req.body;
    const hashPassword = await bcrypt.hash(password, 10)

    let data = [];
    let values = [];
    if (name) {
      data.push("name= ?");
      values.push(name);
    }
    if (email) {
      data.push("email= ?");
      values.push(email);
    }
    if (password) {
      data.push("password= ?");
      values.push(hashPassword);
    }
    if (image) { 
        data.push("image=?");
        values.push(image)
    }
    console.log(values);
    if (data.length == 0) {
      return res.json({ message: "vous avez modifier aucune donnée" });
    }
    values.push(user_id);
    data = data.join(",");
    req.data = data;
    req.values = values;
    next();
  };




  
  module.exports ={verifDataUser, extractToken,verifyToken, verifUserUpdate }