const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const dotenv = require('dotenv')
const asyncHandler = require('express-async-handler')

exports.createPaymentIntent = asyncHandler(async(req, res) => {
 const { amount } = req.body;
try {
 const paymentIntent = await stripe.paymentIntents.create({
amount,
currency: 'usd',
payment_method_types: ['card'],
});

res.status(200).json({ clientSecret: paymentIntent.client_secret });
} catch (error) {
res.status(500).json({ error: error.message });
}
})
