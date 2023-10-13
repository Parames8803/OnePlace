const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const PORT = 5000 || process.env.PORT
const loginRoute = require('./routes/loginRoute')
const notificationRoute = require('./routes/notificationRoute')

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended : true }))


app.use('/', loginRoute);
app.use('/api', notificationRoute)



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
