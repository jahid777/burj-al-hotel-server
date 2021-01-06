const express = require('express');
const bodyParser = require('body-parser'); //clint ar body theke data payte
const cors = require('cors') // clint and server songjog korte
const admin = require('firebase-admin'); //firebase a jwt token verify korte
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

// console.log(process.env.DB_PASS);
const uri = `mongodb+srv://arabian:ArabianHorse79@cluster0.7adfu.mongodb.net/burjAlArab?retryWrites=true&w=majority`;


const port = 8000;

const app = express();

app.use(cors()); //midlewear hisabe cors use koro
app.use(bodyParser.json()); //req ar body take json a banaisi



var serviceAccount = require("./configs/hotel-booking-authentication-firebase-adminsdk-yrumw-7d4183b360.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const password = "ArabianHorse79";






const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });
client.connect(err => {
  const bookingsCollection = client.db("burjAlArab").collection("bookings");
  
  // clint side theke email ar date dhekaitesi
    app.post('/addBooking',(req, res)=>{
        const newBooking = req.body
        bookingsCollection.insertOne(newBooking)
        .then(result =>{
            res.send(result.insertedCount > 0) //0 theke boro haoa mani kisu ekta pathaytesi
            console.log(result);
        })
    })

    //data clint side a read korte ar je booking korbe just tar info show korbe ui te
    app.get('/bookings', (req, res)=>{
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1];
           
            
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                const tokenEmail = decodedToken.email;
                const queryEmail = req.query.email
               
                if(tokenEmail == queryEmail){
                    bookingsCollection.find({email: queryEmail}) //je booking korbe tar dtl dehkayte email: req.query.eamil hoy
                    .toArray((err, documents)=>{
                        res.status(200).send(documents)
                })
                }
                 else{
                    res.status(401).send('un-authorize access');
                 }
                 
                })
                .catch((error) => {
                    res.status(401).send('un-authorize access');
                });

        }

        else{
            res.status(401).send('un-authorize access');
        }
         
    })

});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port);