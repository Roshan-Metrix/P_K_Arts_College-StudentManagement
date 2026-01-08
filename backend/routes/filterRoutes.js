import express from 'express'
import { categoryList } from '../controllers/filterController.js';
import userAuth from '../middleware/userAuth.js';

const filterRouter = express.Router();

// Filter routes
filterRouter.get('/',(req,res) => {
    res.send("Filter Route Working . . .")
});

filterRouter.get('/category/:year',userAuth,categoryList);


export default filterRouter;