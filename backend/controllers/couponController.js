const connection = require("../data/db")

const validate = (req, res) => {

    const { code, cart_total } = req.body

    if (!code || cart_total === undefined) {
        return res.status(400).json({ error: "Dati mancanti" })
    }

    const sql = "SELECT * FROM coupons WHERE code = ?"

    connection.query(sql, [code], (err, results) => {

        if (err) return res.status(500).json({
            error: true,
            message: "Database error"
        })

        if (results.length === 0) {
            return res.status(404).json({ valid: false, message: "Coupon non trovato" })
        }

        const coupon = results[0]
        const now = new Date().getTime()
        const validFrom = new Date(coupon.valid_from).getTime()
        const validTo = new Date(coupon.valid_to).getTime()

        // controllo date
        if (now < validFrom || now > validTo) {
            return res.json({ valid: false, message: "Coupon scaduto o non ancora attivo" })
        }

        // controllo totale minimo carrello
        if (coupon.min_cart_amount !== null && cart_total < coupon.min_cart_amount) {
            return res.json({
                valid: false,
                message: `Totale minimo richiesto: ${coupon.min_cart_amount}€`
            })
        }

        const discount = parseFloat(coupon.value)
        const new_total = Math.max(0, cart_total - discount)

        res.json({
            valid: true,
            coupon,
            discount,
            new_total
        })
    })
}


module.exports = { validate }