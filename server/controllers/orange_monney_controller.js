require("dotenv").config()
const axios = require("axios");

const OM_API_URL = "https://api.orange.com/orange-money/api/v1/transactions";
const OM_CLIENT_ID = "YOUR_CLIENT_ID";
const OM_CLIENT_SECRET = "YOUR_CLIENT_SECRET";

const getAccessToken = async () => {
  const response = await axios.post("https://api.orange.com/oauth/v3/token", {
    grant_type: "client_credentials",
    client_id: OM_CLIENT_ID,
    client_secret: OM_CLIENT_SECRET,
  });

  return response.data.access_token;
};

exports.PayeOrange = async (req, res) => {
  try {
    console.log("Corps de la requête :", req.body); // Vérifiez les données reçues
    const accessToken = await getAccessToken();
    const { phoneNumber, amount } = req.body;

    const paymentRequest = await axios.post(
      OM_API_URL,
      {
        amount: amount,
        currency: "XOF", // Dépend du pays (XOF pour CFA)
        receiverNumber: phoneNumber,
        description: "Paiement avec Orange Money",
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    res.status(200).json({ success: true, message: "Paiement en attente", payment: paymentRequest.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Échec du paiement", error });
  }
};

