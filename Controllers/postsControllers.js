const { Post } = require('../Models/posts');
const client = require('../Services/dbConnexion')
const { extractToken }= require('../Middlewares/middlewares')
const ObjectId = require('bson')
const jwt = require('jsonwebtoken')
require('dotenv').config()


const createPost= async (request, response) => {

   
    if (
       
        !request.body.text||
        !request.body.file ||
        !request.body.visibility 
      
    ) {
        response.status(400).json({ error: 'Some fields are missing' })
    }
        const token = await extractToken(request); !miôj


    jwt.verify(
      token,
      process.env.MY_SUPER_SECRET_KEY,
      async (err, authData) => {
        if (err) {
          response.status(401).json({ error: "Unauthorized" });
          return
    }

    try {
        let post = new Post(
            
            authData.user_id,
            request.body.text,
            request.body.file,
            request.body.visibility,
            new Date(),
            new Date()
          
        )
console.log(post);
        let result = await client
            .db('Social_Network')
            .collection('posts')
            .insertOne(post)
        response.status(200).json(result)
        return
    } catch (err) {
        console.log(err)
        response.status(500).json({ err: 'Erreur serveur' })
    }
      })
};


const getAllPosts = async (request, response)=>{

   try{
            let apiRequest = await client.db('Social_Network').collection('posts').find()
            let posts = await apiRequest.toArray()
            if (posts && posts.length > 0) {
                response.status(200).json(posts)
            } else {
                response.status(204).json({ msg: 'No content' })
            }
        } catch (error) {
            response.status(500).json({ error })
        }
}

const getSpecificPost = async (request, response) => {
    try {
        const objectId = new ObjectId (request.params.id)
       
        let cursor = client
            .db('Social_Network')
            .collection('posts')
            .findOne({ _id: objectId })
        
        let result = await cursor.toArray()
        if (result.length > 0) {
            response.status(200).json(result)
        } else {
            response.status(204).json({ msg: "Ce post n'existe pas" })
        }
    } catch (error) {
        console.log(error)
        response.status(501).json(error)
    }
};

const getMyPosts = async (req, res) => {

    const token = await extractToken(req)

try{


    jwt.verify(
        token,
        process.env.MY_SUPER_SECRET_KEY,
        async (err, authData) => {
            if (err) {
                
                console.log(err)
                res.status(401).json({ err: 'Unauthorized' })
                return
            } else {
               
                let user_id = `${authData.user_id}`
                let posts = await client
                    .db('Social_Network')
                    .collection('posts')
                    .find({ user_id: user })
                    console.log(authData)
                let apiResponse = await posts.toArray()

                res.status(200).json(apiResponse)
                return
            }
        }
    )}catch (e){
        res.status(500).json({err:e})
    }
       
}
const updatePost = async (request, response) => {
    try {
        let id = new ObjectId(request.params.id)
        let user_id = request.body.user_id
        let text = request.body.text
        let file = request.body.file
        let visibility =request.body.visibility
        let updatedAt = new Date();
        console.log(updatedAt);
        let result = await client
            .db('Social_Network')
            .collection('posts')
            .updateOne({ _id: id }, { $set: { user_id, text, file, visibility ,updatedAt } })

        if (result.modifiedCount === 1) {
            response.status(200).json({ msg: 'Modification réussie' })
        } else {
            response.status(404).json({ msg: "Cet utilisateur n'existe pas" })
        }
    } catch (error) {
        console.log(error)
        response.status(501).json(error)
    }
};
const deletePost = async (request, response) => {
    try {
        let id = new ObjectId(request.params.id)
        let result = await client
            .db('Social_Network')
            .collection('posts')
            .deleteOne({ _id: id })
        if (result.deletedCount === 1) {
            response.status(200).json({ msg: 'Suppression réussie' })
        } else {
            response.status(404).json({ msg: "Cet utilisateur n'existe pas" })
        }
    } catch (error) {
        console.log(error)

        res.status(501).json(error)
    }
};





module.exports={ createPost , getAllPosts , getSpecificPost , getMyPosts ,updatePost ,deletePost}