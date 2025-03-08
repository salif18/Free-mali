require("dotenv").config()
const axios = require("axios");

const OM_API_URL = "https://api.orange.com/orange-money/api/v1/transactions";
const OM_CLIENT_ID = "YOUR_CLIENT_ID";
const OM_CLIENT_SECRET ="YOUR_CLIENT_SECRET";
const OM_MERCHANT_KEY = "YOUR_MARCHAND_SECRET"; // Clé du marchand

// Fonction pour obtenir le token d'accès
const getAccessToken = async () => {
  const response = await axios.post("https://api.orange.com/oauth/v3/token", {
    grant_type: "client_credentials",
    client_id: OM_CLIENT_ID,
    client_secret: OM_CLIENT_SECRET,
  });

  return response.data.access_token;
};

// Contrôleur pour initier un transfert d'argent avec commission
exports.TransfertAvecCommission = async (req, res) => {
  try {
    const { phoneNumber, amount } = req.body;
    console.log("Corps de la requête :", req.body);
    // Validation des entrées
    if (!phoneNumber || !amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: "Données invalides" });
    }

    const accessToken = await getAccessToken();

    // Calculer les 5% de commission
    const commission = amount * 0.05;
    const montantTransfert = amount - commission;

    // Transférer le montant restant au destinataire
    const transfertRequest = await axios.post(
      OM_API_URL,
      {
        amount: montantTransfert,
        currency: "XOF",
        receiverNumber: phoneNumber,
        description: "Transfert d'argent avec commission",
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // Crediter les 5% sur le compte marchand
    const paiementCommission = await axios.post(
      OM_API_URL,
      {
        merchant_key: OM_MERCHANT_KEY, // Clé du marchand
        amount: commission,
        currency: "XOF",
        description: "Commission sur transfert",
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    res.status(200).json({
      success: true,
      message: "Transfert et commission effectués",
      transfert: transfertRequest.data,
      commission: paiementCommission.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Échec du transfert", error: error.message });
  }
};


// Contrôleur pour initier un paiement marchand
exports.abonnePaiementMarchand = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log("Corps de la requête :", req.body);
    // Validation des entrées
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: "Montant invalide" });
    }

    const accessToken = await getAccessToken();

    const paymentRequest = await axios.post(
      OM_API_URL,
      {
        merchant_key: OM_MERCHANT_KEY, // Clé du marchand
        amount: amount,
        currency: "XOF",
        description: "Paiement pour un produit",
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    res.status(200).json({ success: true, message: "Paiement en attente", payment: paymentRequest.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Échec du paiement", error: error.message });
  }
};

