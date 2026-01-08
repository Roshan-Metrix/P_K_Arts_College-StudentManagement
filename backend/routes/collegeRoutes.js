import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { AddCollegeEvents, AddCollegeEventsGallery, getCollegeEvents, getCollegeEventsGallery } from '../controllers/collegeController.js';

const collegeRouter = express.Router();

collegeRouter.get('/',(req,res) => {
    res.send("College Route Working . . .")
});

collegeRouter.post('/add-events', userAuth, AddCollegeEvents)
collegeRouter.get('/get-events', getCollegeEvents)
collegeRouter.post('/add-event-images', userAuth, AddCollegeEventsGallery)
collegeRouter.get('/get-event-images', getCollegeEventsGallery)



export default collegeRouter;