import express from 'express'
import userAuth from '../middleware/userAuth.js';

const collegeRouter = express.Router();

// 
collegeRouter.get('/',(req,res) => {
    res.send("College Route Working . . .")
});

collegeRouter.post('/')


export default collegeRouter;