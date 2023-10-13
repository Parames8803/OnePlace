const express = require('express');
const router = express.Router();
const db = require('../dbConfig/db');
const shortid = require('shortid');
const { verifyToken } = require('../helpers/token');

router.post('/apply', async (req, res) => {
  const { token, type, header, body, fromDate, toDate } = req.body;
  const userData = await verifyToken(token);
  const stuId = userData.stuId;
  const mentorId = userData.mentorId
  const notifyId = await generateUniqueId()
  const isUpdated = false
  const status = false
  const approvedBy = null
  const appliedOn = new Date()
  const insertApplication = "INSERT into notification_center( userId, stuId, notifyId, type, header, body, fromDate, toDate, isUpdated, status, approvedBy, appliedOn ) values ( ?,?,?,?,?,?,?,?,?,?,?,? )";
  db.query(insertApplication, [mentorId, stuId, notifyId, type, header, body, fromDate, toDate, isUpdated, status, approvedBy, appliedOn]);
  let updateProgress = "INSERT into progressbar( studentId, notifyId, isUpdated, isApprovedMentor, isApprovedadvisor, isApprovedHod, isRejectedMentor, isRejectedadvisor, isRejectedHod, approvedOn ) VALUES ( ?,?,?,?,?,?,?,?,?,? )";
  db.query(updateProgress, [stuId, notifyId, isUpdated, false, false, false, false, false, false]);
  console.log("Application Raised Success")
})


router.post('/getnotification', async (req, res) => {
  const token = req.body.token;
  const userData = await verifyToken(token)
  const staffId = userData.staffId;
  const getNotification = `SELECT notifyId, stuId, approvedBy FROM notification_center where userId = ? and isUpdated = ${false}`;
  db.query(getNotification, [staffId], (err, result) => {
    if (err) console.log(err)
    const notifyId = result[0].notifyId
    const stuId = result[0].stuId
    const approvedById = result[0].approvedBy
    const getStudent = "SELECT studentName, dept FROM student_list where studentId = ?";
    db.query(getStudent, [stuId], (error, studata) => {
      if (error) console.log(error)
      const stuName = studata[0].studentName
      const dept = studata[0].dept
      if (approvedById == null) {
        console.log({
          notifyId: notifyId,
          studentId: stuId,
          studentName: stuName,
          dept: dept,
          ApprovedBy: null,
          approvedById: null
        })
      } else {
        const getStaff = "SELECT staffName FROM staff_list where userId = ?";
        db.query(getStaff, [approvedById], (error, staffdata) => {
          if (error) console.log(error)
          const staffName = staffdata[0].staffName
          console.log({
            notifyId: notifyId,
            studentId: stuId,
            studentName: stuName,
            dept: dept,
            ApprovedBy: staffName,
            approvedById: approvedById
          })
        })
      }
    })
  })
})


router.post('/getnotification/id', (req, res) => {
  const { token, notifyId } = req.body;
  const getNotification = `SELECT * FROM notification_center where notifyId = ? and isUpdated = ${false}`;
  db.query(getNotification, [notifyId], (err, result) => {
    if (err) console.log(err)
    console.log(result[0])
  })
})


router.post('/approve', async (req, res) => {
  const { token, notifyId } = req.body;
  const userData = await verifyToken(token);
  const staffId = userData.staffId
  const hodId = p5w9ers;
  const date = new Date()
  const getNotification = " SELECT stuId, type, approvedBy, appliedOn FROM notification_center where notifyId = ? ";
  db.query(getNotification, [notifyId], (err, result) => {
    if (err) console.log(err)
    const stuId = result[0].stuId
    const type = result[0].type
    const appliedOn = result[0].appliedOn
    const isApproved = true
    const approvedById = result[0].approvedBy
    if (approvedById == null) {
      approvedById = staffId
      const getAdvisor = "SELECT advisorId from student_list where studentId = ?";
      db.query(getAdvisor, [stuId], async (error, advisordata) => {
        if (error) console.log(error)
        const advisorId = advisordata[0].advisorId
        let insertApprove = "INSERT into notification_center( userId, stuId, approvedBy ) VALUES ( ?,?,? ) where notifyId = ?";
        await db.query(insertApprove, [advisorId, stuId, staffId, notifyId]);
        let updateProgress = "INSERT into progressbar( studentId, notifyId, isUpdated, isApprovedMentor, isApprovedadvisor, isApprovedHod, isRejectedMentor, isRejectedadvisor, isRejectedHod, approvedOn ) VALUES ( ?,?,?,?,?,?,?,?,?,? )";
        await db.query(updateProgress, [stuId, notifyId, false, true, false, false, false, false, false, date]);
        let updatePastNotify = "INSERT into pastnotification( userId, stuId, notifyId, type, isApproved ) VALUES ( ?,?,?,?,? )";
        await db.query(updatePastNotify, [staffId, stuId, notifyId, type, true]);
        let insertStuNotify = "INSERT into stunotification( stuId, userId, notifyId, type, isApproved, appliedOn ) VALUES ( ?,?,?,?,? )";
        db.query(insertStuNotify, [stuId, staffId, notifyId, type, isApproved, appliedOn])
        console.log("Application Approved Success and Sent to ADVISOR")
      })
    } else {
      const checkStaffId = "SELECT role from users where userId = ?";
      db.query(checkStaffId, [approvedById], async (err, staffdata) => {
        if (err) console.log(err)
        const staffRole = staffdata[0].role
        if (staffRole == "mentor") {
          let insertApprove = "INSERT into notification_center( userId, stuId, notifyId, approvedBy ) VALUES ( ?,?,?,? )";
          await db.query(insertApprove, [hodId, stuId, notifyId, staffId])
          let updateProgress = "INSERT into progressbar( studentId, isUpdated, isApprovedMentor, isApprovedadvisor, isApprovedHod, isRejectedMentor, isRejectedadvisor, isRejectedHod ) VALUES ( ?,?,?,?,?,?,?,? ) where notifyId = ?";
          await db.query(updateProgress, [stuId, false, true, true, false, false, false, false, notifyId]);
          let updatePastNotify = "INSERT into pastnotification( userId, stuId, notifyId, type, isApproved ) VALUES ( ?,?,?,?,? )";
          await db.query(updatePastNotify, [staffId, stuId, notifyId, type, true]);
          let insertStuNotify = "INSERT into stunotification( stuId, userId, notifyId, type, isApproved, appliedOn ) VALUES ( ?,?,?,?,? )";
          db.query(insertStuNotify, [stuId, staffId, notifyId, type, isApproved, appliedOn])
          console.log("Application Approved Success and Sent to HOD")
        } else {
          let insertApprove = "INSERT into notification_center( stuId, notifyId, approvedBy ) VALUES ( ?,?,? )";
          await db.query(insertApprove, [stuId, notifyId, hodId])
          let updateProgress = "INSERT into progressbar( studentId, isUpdated, isApprovedMentor, isApprovedadvisor, isApprovedHod, isRejectedMentor, isRejectedadvisor, isRejectedHod, approvedOn ) VALUES ( ?,?,?,?,?,?,?,?,? ) where notifyId = ?";
          await db.query(updateProgress, [stuId, true, true, true, true, false, false, false, date, notifyId]);
          let updatePastNotify = "INSERT into pastnotification( userId, stuId, notifyId, type, isApproved ) VALUES ( ?,?,?,?,? )";
          await db.query(updatePastNotify, [hodId, stuId, notifyId, type, true]);
          let insertStuNotify = "INSERT into stunotification( stuId, userId, notifyId, type, isApproved, appliedOn ) VALUES ( ?,?,?,?,? )";
          db.query(insertStuNotify, [stuId, hodId, notifyId, type, isApproved, appliedOn])
          console.log("Application Approved Success")
        }
      })
    }
  })
})


router.post('/reject', async (req, res) => {
  const { token, notifyId } = req.body;
  const userData = await verifyToken(token);
  const staffId = userData.staffId
  const hodId = p5w9ers;
  const date = new Date()
  const isUpdated = true
  const status = true
  const isApproved = false
  const getNotification = " SELECT stuId, type, approvedBy FROM notification_center where notifyId = ? ";
  db.query(getNotification, [notifyId], (err, result) => {
    const stuId = result[0].stuId
    const type = result[0].type
    const approvedById = result[0].approvedBy
    if (approvedById == null) {
      let updateNotify = "INSERT into notification_center( isUpdated, status ) VALUES ( ?,? ) where notifyId = ?";
      db.query(updateNotify, [isUpdated, status, notifyId])
      let insertPastNotify = "INSERT into pastnotification( userId, stuId, notifyId, type, isApproved ) VALUES ( ?,?,?,?,? )";
      db.query(insertPastNotify, [staffId, stuId, notifyId, type, isApproved])
      let updateProgress = "INSERT into progressbar( studentId, isUpdated, isApprovedMentor, isApprovedadvisor, isApprovedHod, isRejectedMentor, isRejectedadvisor, isRejectedHod, approvedOn ) VALUES ( ?,?,?,?,?,?,?,?,? ) where notifyId = ?";
      db.query(updateProgress, [stuId, true, false, false, false, true, false, false, notifyId])
      console.log("Application Rejected By Mentor")
    } else {
      const checkStaffId = "SELECT role from users where userId = ?";
      db.query(checkStaffId, [approvedById], async (err, staffdata) => {
        if (err) console.log(err)
        const staffRole = staffdata[0].role
        if (staffRole == "mentor") {
          let updateNotify = "INSERT into notification_center( isUpdated, status ) VALUES ( ?,? ) where notifyId = ?";
          db.query(updateNotify, [isUpdated, status, notifyId])
          let insertPastNotify = "INSERT into pastnotification( userId, stuId, notifyId, type, isApproved ) VALUES ( ?,?,?,?,? )";
          db.query(insertPastNotify, [staffId, stuId, notifyId, type, isApproved])
          let updateProgress = "INSERT into progressbar( studentId, isUpdated, isApprovedMentor, isApprovedadvisor, isApprovedHod, isRejectedMentor, isRejectedadvisor, isRejectedHod, approvedOn ) VALUES ( ?,?,?,?,?,?,?,?,? ) where notifyId = ?";
          db.query(updateProgress, [stuId, true, true, false, false, false, true, false, notifyId])
          console.log("Application Rejected By Advisor")
        } else {
          let updateNotify = "INSERT into notification_center( isUpdated, status ) VALUES ( ?,? ) where notifyId = ?";
          db.query(updateNotify, [isUpdated, status, notifyId])
          let insertPastNotify = "INSERT into pastnotification( userId, stuId, notifyId, type, isApproved ) VALUES ( ?,?,?,?,? )";
          db.query(insertPastNotify, [hodId, stuId, notifyId, type, isApproved])
          let updateProgress = "INSERT into progressbar( studentId, isUpdated, isApprovedMentor, isApprovedadvisor, isApprovedHod, isRejectedMentor, isRejectedadvisor, isRejectedHod, approvedOn ) VALUES ( ?,?,?,?,?,?,?,?,? ) where notifyId = ?";
          db.query(updateProgress, [stuId, true, true, true, false, false, false, true, date, notifyId])
        }
      })
    }
  })
})



const generateUniqueId = () => {
  return shortid.generate();
}

module.exports = router;
