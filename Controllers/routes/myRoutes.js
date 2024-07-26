const express = require("express");
const { register, valideAccount ,insertImage ,login ,ctrlAllUsers, ctrlUpdateUser, deleteAccount , researchUser ,disableAccount, ctrlFollowing , ctrlAllFollowers, userProfile} = require("../Controllers");
const { verifDataUser ,verifyToken,verifUserUpdate, extractToken } = require("../../Middlewares/middlewares");
const { createPost, getAllPosts,getMyPosts, getSpecificPost, updatePost, deletePost } = require("../postsControllers");
const { createReaction ,getAllReactions ,getSpecificReaction , updateReaction , deleteReaction} = require("../reactionsControllers");

const router = express.Router()

//USER//
router.post('/register',verifDataUser, register);
router.post('/insertImage',insertImage);
router.get('/email/validate/:token', valideAccount);
router.post('/login', login);
router.patch('/updateUser/:user_id',verifUserUpdate, ctrlUpdateUser);
router.post('/researchUser', researchUser);
router.post('/createPost',createPost );
router.post('/createReaction' ,createReaction);
router.get('/myPosts',verifyToken, getMyPosts);
router.post('/following', ctrlFollowing);
router.get('/Followers/:user_id', ctrlAllFollowers); 
router.get('/userProfile',extractToken, verifyToken,  userProfile);



//ADMIN//

router.get('/allUsers', ctrlAllUsers);
router.patch('/disableAccount/:user_id',disableAccount);
router.delete('/deleteUser/:user_id' , deleteAccount);
router.get('/allPosts', getAllPosts );
router.get('/post/:id',getSpecificPost);
router.get('/allReactions',getAllReactions);
router.get('/reaction/:id' ,getSpecificReaction);
router.patch('/updatePost/:id', updatePost);
router.delete('/deletePost/:id', deletePost);
router.patch('updateReaction/:id', updateReaction);
router.delete('/deleteReaction/:id', deleteReaction);
 


module.exports = router;