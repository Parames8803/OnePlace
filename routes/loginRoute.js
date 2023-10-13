
const express = require('express');
const router = express.Router();
const db = require('../dbConfig/db');
const { generateToken } = require('../helpers/token');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const checkUsername = "select * from users where userName = ? and password = ?";
  db.query(checkUsername, [username, password], (err, result) => {
    if (err) console.log(err)
    if (result[0].role == "student") {
      const stuId = result[0].userId
      let getUser = "SELECT * from student_list where studentId = ?";
      db.query(getUser, [stuId], async (error, studata) => {
        if (error) console.log(error)
        const token = await generateToken({
          stuId: studata[0].studentId,
          mentorId: studata[0].mentorId,
          advisorId: studata[0].advisorId
        })
        if (token) res.send({ token : token})
        res.send("User not Found")
      })
    } else {
      const staffId = result[0].userId
      let getStaff = "SELECT * from staff_list where userId = ?";
      db.query(getStaff, [staffId], async (error, staffdata) => {
        if (error) console.log(error)
        const token = await generateToken({
          staffId: staffdata[0].userId,
        })
        if (token) res.send({ token : token})
        res.send("User not Found")
      })
    }
  });
});

module.exports = router;
