const { Reaction } = require('../Models/reactions');
const client = require('../Services/dbConnexion')
const ObjectId  = require('bson')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const createReaction = async (request, response) => {
    if (
        !request.body.like ||
        !request.body.comment

    ) {
        response.status(400).json({ error: 'Some fields are missing' })
    }

    try {
        let reaction = new Reaction (

            authData.user_id,
            request.body.like,
            request.body.comment,
            new Date(),
            new Date()

        )

        let result = await client
            .db('Social_Network')
            .collection('reactions')
            .insertOne(reaction)
        response.status(200).json(result)
    } catch (e) {
        console.log(e)
        response.status(500).json(e)
    }
}

const getAllReactions = async (request, response) => {


    try {
        let apiRequest = client.db('Social_Network').collection('reactions').find()
        let reactions = await apiRequest.toArray()
        if (reactions && reactions.length > 0) {
            response.status(200).json(reactions)
        } else {
            response.status(204).json({ msg: 'No content' })
        }
    } catch (error) {
        response.status(500).json({ error })
    }
};

const getSpecificReaction = async (request, response) => {
    try {
        const objectId = new ObjectId (request.params.id)
       
        let cursor = client
            .db('Social_Network')
            .collection('reactions')
            .findOne({ _id: objectId })
        
        let result = await cursor.toArray()
        if (result.length > 0) {
            response.status(200).json(result)
        } else {
            response.status(204).json({ msg: "Cette réaction n'existe pas" })
        }
    } catch (error) {
        console.log(error)
        response.status(501).json(error)
    }
};

const updateReaction = async (request, response) => {
    try {
        let id = new ObjectId(request.params.id)
        let user_id = request.body.user_id
        let like = request.body.like
        let comment = request.body.comment
        let updatedAt = new Date();
        
        let result = await client
            .db('Social_Network')
            .collection('reactions')
            .updateOne({ _id: id , }, { $set: { user_id, like, comment, updatedAt } })

        if (result.modifiedCount === 1) {
            response.status(200).json({ msg: 'Modification réussie' })
        } else {
            response.status(404).json({ msg: "Cette réaction n'existe pas" })
        }
    } catch (error) {
        console.log(error)
        response.status(501).json(error)
    }
};
const deleteReaction = async (request, response) => {
    try {
        let id = new ObjectId(request.params.id)
        let result = await client
            .db('social_network')
            .collection('reactions')
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






module.exports = { createReaction, getAllReactions, getSpecificReaction ,updateReaction , deleteReaction}
