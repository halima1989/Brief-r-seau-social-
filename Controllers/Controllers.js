const { pool } = require("../Services/sql");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { transporter } = require('../Services/mailer');
const client = require('../Services/dbConnexion')
const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
require('dotenv').config();
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
const uploadDirectory = path.join(__dirname, '../uploads');


const register = async (req, res) => {
console.log(req.body)
    if (
        !req.body.name ||
        !req.body.email ||
        !req.body.password ||
        !req.body.image

    ) {

        console.log(req.body)
        res.status(400).json({ error: 'missing fields' })
        return
    }
    let name = req.body.name
    let email = req.body.email
    let password = req.body.password
    let image = req.body.image
    console.log("le mail est ", email)
    const values = [email]
    const sqlCheck = `SELECT email FROM users WHERE email = ?`
    try {

        const [result] = await pool.execute(sqlCheck, values)
        if (result.length !== 0) {
            res.status(400).json({ error: 'Invalid credentials' })
            return
        } else {
            const hash = await bcrypt.hash(password, 10)
            const hashEmail = await bcrypt.hash(email, 10)
            const cleanToken = hashEmail.replaceAll('/', "")
            const sqlInsert =
                'INSERT INTO `users` VALUES (NULL, ?, ?, ?, ?, 0, ?, 1,?)'


            const insertValues = [name, email, hash, image, cleanToken, new Date()]

            const [rows] = await pool.execute(sqlInsert, insertValues)
            console.log(rows)
            if (rows.affectedRows > 0) {
                const info = await transporter.sendMail({
                    from: `${process.env.SMTP_EMAIL}`,
                    to: email,
                    subject: 'Email activation',
                    text: 'Activate your remail',
                    html: `<p> You need to activate your email, to access our services, please click on this link :
                  <a href="http://localhost:4040/email/validate/${cleanToken}">Activate your email</a>
            </p>`,
                })
                return res.status(201).json({ success: 'registration successfull' })

            } else {
                res.status(500).json({ error: 'registration failed.' })
                return
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
        return
    }
};


const valideAccount = async (req, res) => {
    try {

        const token = req.params.token;
        console.log(token)
        const sql = `SELECT * FROM users WHERE token = ?`;
        const values = [token];
        const [result] = await pool.execute(sql, values);
        if (!result) {
            res.status(204).json({ error: 'Invalid credentials' });
            return;
        }
        await pool.execute(
            `UPDATE users SET is_active = 1, token = NULL WHERE token = ?`,
            [token]
        );
        res.status(200).json({ result: 'registration successfull' });
    } catch (error) {
        res.status(500).json({ error: error.stack });
        console.log(error.stack);
    }
};


// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'ejs')

const insertImage= async (req, res) => {
  let newFileName
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDirectory)
    },
    filename: function (req, file, cb) {
      newFileName = `${file.fieldname}-${Date.now()}.jpg`
      cb(null, newFileName)
    },
  })

  const maxSize = 3 * 1000 * 1000

  const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
      var filetypes = /jpeg|jpg|png/
      var mimetype = filetypes.test(file.mimetype)
      var extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      )

      if (mimetype && extname) {
        return cb(null, true)
      }

      cb(
        'Error: File upload only supports the ' +
          'following filetypes - ' +
          filetypes
      )
    },
  }).single('image')

  upload(req, res, function (err) {
    if (err) {
      res.send(err)
    } else {
      res.send({ newFileName: newFileName })
    }
  })
}


const login = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400).json({ error: 'missing fields' })
        return
    }

    const email = req.body.email
    const password = req.body.password

    try {
        const values = [email]
        const sql = `SELECT * FROM users WHERE email = ? `
        const [result] = await pool.query(sql, values)
        console.log(result)

        if (result.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        } else {
            await bcrypt.compare(
                password,
                result[0].password,

                function (err, bcyrptresult) {
                    if (err) {
                        res.status(401).json({ error: 'Invalid credentials' })
                        return
                    }
                    const token = jwt.sign(
                        {
                            email: result[0].email,
                            user_id: result[0].user_id,
                        },
                        process.env.MY_SUPER_SECRET_KEY,
                        { expiresIn: '20d' }
                    )
                    console.log(token)
                    res.status(200).json({ jwt: token, role: result[0].role_id, name: result[0].name })
                    return
                }

            )
        }
    } catch (error) {
        console.log(error.stack)
        res.status(500).json({ message: 'Erreur serveur' })
    }
};

const ctrlAllUsers = async (req, res) => {

    try {
        const [rows, fields] = await pool.query(`SELECT image,name, email,create_at,role_name as role FROM users 
        JOIN role ON users.role_id=role.role_id`);
        console.log(rows);
        res.json(rows)
    } catch (err) {
        console.log(err);

    }
};

const ctrlUpdateUser = async (req, res) => {
    try {
        let data = req.data;
        let values = req.values;
        console.log(data)
        const sql = `UPDATE users SET ${data} where user_id= ? `;
        const [result] = await pool.execute(sql, values);
        console.log(result)
        res.status(200).json(result);

    } catch (error) {

        console.log(error.stack);
        res.status(500).json({ message: "erreur serveur" });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const [rows] = await pool.execute(`DELETE FROM users WHERE user_id = ?`, [req.params.user_id]);
        res.status(200).json({ data: rows });
    } catch (error) {
        console.log(error.stack);
        res.status(500).json({ message: "erreur serveur" });
    }
};

const researchUser = async (req, res) => {
  
        try {
            console.log("je suis dans le controleur de research")
          const search = req.body.search;
          console.log(search)
          const [rows] = await pool.query(
            `SELECT name ,email FROM users WHERE name LIKE "%${search}%" OR email LIKE "%${search}%"`
          );
          res.status(200).json(rows);
        } catch (error) {
          res.status(500).json({ error: error.stack });
          return;
        }
      };

const disableAccount = async (req,res)=>{
    const user_id= req.params.user_id 

try {
    const [rows, fields] = await pool.query(`UPDATE users SET is_active=0 WHERE user_id=? `, [user_id]);
        console.log(rows);
        res.json(rows)


} catch (error) {
    res.status(500).json({ error: error.stack });
          return;
        }
};

const ctrlFollowing = async (req,res)=> {

const follower_user_id= req.body.follower_user_id
const followed_user_id =req.body.followed_user_id

try {
    
const [rows,fields]= await pool.query(`INSERT INTO follow (follower_user_id, followed_user_id, created_at) VALUES (?,?,NOW())`, [user_id, followed_user_id, follower_user_id])
console.log(rows);

res.json( {message:"follow successful"})


} catch (error) {
    res.status(500).json({error :error.stack})
}
};

const ctrlAllFollowers = async (req, res)=>{

   let user_id= followed_user_id.user_id
   try {
    const [rows, fields]= await pool.query(`SELECT name as userName, follower_user_id as follower FROM follow
    JOIN users on follower_user_id=users.user_id
    WHERE user_id= ?`, [user_id])
    console.log(rows);
    res.json(rows)
    
   } catch (error) {
    res.status(500).json({error: error.stack})
   }
};


const userProfile = async(req, res)=>{
   const token = await extractToken(req)
   console.log(token);
try{

    jwt.verify(
        token,
        process.env.MY_SUPER_SECRET_KEY,
        async (err, authData) => {
            if (err) {
                
                console.log(authData)
                res.status(401).json({ err: 'Unauthorized' })
            }})
           
               
        let user_id = authData.user_id
        
        const [rows, fields]= await pool.query(`SELECT name, email, password, image, create_at FROM users WHERE user_id=?`, [user_id ])
        console.log(rows);
        res.status(200).json(rows)
        if (rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            
        }
        
       } catch (error) {
        res.status(500).json({error: error.stack})
       }
    
};



module.exports = { 
     register,
     login, 
     valideAccount, 
     insertImage, 
     ctrlAllUsers, 
     ctrlUpdateUser, 
     deleteAccount ,
     researchUser,
     disableAccount,
     ctrlFollowing, 
     ctrlAllFollowers,
     userProfile
    }