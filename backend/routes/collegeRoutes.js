import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  AddCollegeEvents,
  AddCollegeEventsGallery,
  AddCoursesFiles,
  getCollegeEvents,
  getCollegeEventsGallery,
  getCoursesFiles,
  getNotices,
  updateNotices,
} from "../controllers/collegeController.js";
import uploadEventImages from "../middleware/uploadEventImage.js";
import uploadCoursePdf from "../middleware/uploadCoursePdf.js";

const collegeRouter = express.Router();

collegeRouter.get("/", (req, res) => {
  res.send("College Route Working . . .");
});

// Adding & Fetching events for the calendar
collegeRouter.post("/add-events", userAuth, AddCollegeEvents);
collegeRouter.get("/get-events", getCollegeEvents);

// Adding & Fetching Events images, name , desc
collegeRouter.post(
  "/add-event-images",
  userAuth,
  uploadEventImages.fields([
    { name: "photo1", maxCount: 1 },
    { name: "photo2", maxCount: 1 },
    { name: "photo3", maxCount: 1 },
  ]),
  AddCollegeEventsGallery
);
collegeRouter.get("/get-event-images", getCollegeEventsGallery);

// Adding & Fetching Events courses
collegeRouter.post(
  "/add-course-files",
  userAuth,
  uploadCoursePdf.single("file"),
  AddCoursesFiles
);
collegeRouter.get("/get-course-files/:sub_name",getCoursesFiles);

// Adding & Fetching Notices
collegeRouter.put("/update-notice",userAuth,updateNotices);
collegeRouter.get("/get-notice",getNotices);


export default collegeRouter;
