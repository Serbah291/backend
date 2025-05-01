const PromoCode = require('../models/CodePromo')

// ➤ Créer un coupon
exports.createCoupon = async (req, res) => {
  try {
    const { nameOfCoupon, expirationDateCoupon, discount } = req.body
    const newCoupon = new PromoCode({
      nameOfCoupon,
      expirationDateCoupon,
      discount,
    })
    await newCoupon.save()
    res.status(201).json({ message: 'Coupon créé avec succès', newCoupon })
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Erreur lors de la création du coupon', error })
  }
}

// ➤ Obtenir un coupon par ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await PromoCode.findById(req.params.id)
    if (!coupon) return res.status(404).json({ message: 'Coupon non trouvé' })
    res.status(200).json(coupon)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erreur lors de la récupération du coupon', error })
  }
}

// ➤ Obtenir tous les coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await PromoCode.find()
    res.status(200).json(coupons)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erreur lors de la récupération des coupons', error })
  }
}

// ➤ Supprimer un coupon par ID
exports.deleteCouponByID = async (req, res) => {
  try {
    const coupon = await PromoCode.findByIdAndDelete(req.params.id)
    if (!coupon) return res.status(404).json({ message: 'Coupon non trouvé' })
    res.status(200).json({ message: 'Coupon supprimé avec succès' })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erreur lors de la suppression du coupon', error })
  }
}

exports.updateCoupon = async (req, res) => {
  try {
    const { nameOfCoupon, expirationDateCoupon, discount } = req.body
    const coupon = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { nameOfCoupon, expirationDateCoupon, discount },
      { new: true }
    )
    if (!coupon) return res.status(404).json({ message: 'Coupon non trouvé' })
    res.status(200).json(coupon)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erreur lors de la mise à jour du coupon', error })
  }
}
