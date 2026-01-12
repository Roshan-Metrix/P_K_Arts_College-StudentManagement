import express from 'express';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import {
  addCoursesAndYears,
  AddStudentDetail,
  deleteStudent,
  getCoursesAndYears,
  getLoggedInUserData,
  storeExtraStudentData,
  updateExtraStudentData,
  updateStudentDetail,
  viewAllStudentsData,
  viewStudentData,
} from '../controllers/rolesController.js';
import uploadStudentImage from '../middleware/uploadStudentImage.js';

const roleRouter = express.Router();

roleRouter.post('/students', userAuth, uploadStudentImage.single('photo'), AddStudentDetail);
roleRouter.post('/students/moreData/:student_uid', userAuth, storeExtraStudentData);
roleRouter.get('/getStudentsData', userAuth, viewAllStudentsData);
roleRouter.get('/viewStudentData/:student_uid', userAuth, viewStudentData);
roleRouter.put('/updateStudentData/:student_uid', userAuth, uploadStudentImage.single('photo'), updateStudentDetail);
roleRouter.put('/updateExtraStudentData/:student_uid', userAuth, updateExtraStudentData);
roleRouter.delete('/deleteStudent/:student_uid', userAuth, deleteStudent);
roleRouter.get('/user/data', userAuth, getLoggedInUserData);
roleRouter.get('/get-courses-years', userAuth, getCoursesAndYears);
roleRouter.post('/admin/add-courses-and-years', userAuth, adminAuth, addCoursesAndYears);

export default roleRouter;
