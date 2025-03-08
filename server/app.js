//importations
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require("axios");
const path = require('path')
const Databases_MongoDB = require('./database/mongoDB')
const app = express()
const userRouter = require('./routes/users')
const profileRouter = require('./routes/userProfile');
const profilAdmin_Router = require('./routes/adminProfil');
const offreRouter = require('./routes/offres')
const chatRouter = require('./routes/chat')
const messageRouter = require('./routes/message')
const notificationRouter = require('./routes/notifications');
const messageAdminRouter = require('./routes/messageAdmin');
const archiveCourierRouter = require('./routes/archiveCourier');
const recomandationRouter = require('./routes/recomandation');
const videosRtr = require('./routes/videos');
const imagesRtr = require('./routes/images')
const srtipeRouter = require('./routes/stripe')
// const orangeRouter = require('./routes/orange_monney')

//configurations
app.use(cors());
app.use(express.json()) 
app.use('/images',express.static(path.join(__dirname,'images')))
app.use('/videos',express.static(path.join(__dirname,'videos')))

// les fonctions de route
app.use('/auth',userRouter)
app.use('/profiles',profileRouter);
app.use('/profils/admin', profilAdmin_Router);
app.use('/offres',offreRouter)
app.use('/chat',chatRouter)
app.use('/message',messageRouter);
app.use('/courriers', messageAdminRouter);
app.use('/archives/couriers', archiveCourierRouter);
app.use('/notifications',notificationRouter);
app.use('/recomandations', recomandationRouter);
app.use('/videos',videosRtr)
app.use('/images',imagesRtr)
app.use('/checkout',srtipeRouter)
// app.use('/checkout',orangeRouter)

// paypal
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Sandbox API

// 🔹 1. Créer une commande PayPal
app.post("/create-paypal-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;
console.log(req.body)
    // Générer un token d'authentification
    const auth = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_SECRET,
        },
      }
    );

    const accessToken = auth.data.access_token;

    // Créer une commande
    const order = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency || "USD",
              value: amount,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ id: order.data.id });
  } catch (error) {
    res.status(500).json(error.response.data);
  }
});

// 🔹 2. Capturer un paiement
app.post("/capture-paypal-order/:orderID", async (req, res) => {
  try {
    const { orderID } = req.params;

    // Générer un token d'authentification
    const auth = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_SECRET,
        },
      }
    );

    const accessToken = auth.data.access_token;

    // Capturer le paiement
    const capture = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(capture.data);
  } catch (error) {
    res.status(500).json(error.response.data);
  }
});



//connection a la base de donnees
Databases_MongoDB();
  
//exportation de l'application
module.exports = app  