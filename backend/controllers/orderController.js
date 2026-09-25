const connection = require("../data/db");
const { validationResult } = require("express-validator");
const {
  sendOrderConfirmation,
  sendAdminOrderConfirmation,
} = require("../services/mail");

// show - mostra un ordine con i suoi prodotti
const show = (req, res) => {
  const { id } = req.params;

  const orderSql = `SELECT * FROM orders WHERE id = ?`;

  connection.query(orderSql, [id], (err, orderResults) => {
    if (err)
      return res.status(500).json({
        error: true,
        message: "Database error",
      });

    if (orderResults.length === 0) {
      return res.status(404).json({ error: "Ordine non trovato" });
    }

    const order = orderResults[0];

    // prendo i prodotti collegati all'ordine
    const itemsSql = `
            SELECT p.id, p.name, p.slug, p.price, p.img_url, op.quantity
            FROM order_product op
            JOIN products p ON p.id = op.product_id
            WHERE op.order_id = ?
        `;

    connection.query(itemsSql, [id], (err, itemsResults) => {
      if (err)
        return res.status(500).json({
          error: true,
          message: "Database error",
        });

      res.json({
        ...order,
        items: itemsResults,
      });
    });
  });
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// store - crea un nuovo ordine partendo dal carrello (localStorage)
const store = (req, res) => {
  // controlla se la validazione ha trovato errori
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ error: true, errors: result.array() });
  }

  const {
    user_full_name,
    email,
    phone_number,
    address,
    zipcode,
    city,
    country,
    products,
    coupon_code,
  } = req.body;

  // prendo i prodotti dal db
  const productIds = products.map((p) => p.id);
  const productSql = `SELECT id, name, price, stock FROM products WHERE id IN (?)`;

  connection.query(productSql, [productIds], (err, productResults) => {
    if (err)
      return res.status(500).json({
        error: true,
        message: "Database error",
      });

    if (productResults.length === 0) {
      return res.status(404).json({ error: "Prodotti non trovati" });
    }

    // controllo stock e calcolo il totale del carrello
    let total = 0;
    for (let i = 0; i < products.length; i++) {
      const cartItem = products[i];
      const dbProduct = productResults.find((p) => p.id === cartItem.id);

      if (!dbProduct) {
        return res.status(404).json({ error: "Prodotto non trovato" });
      }

      // controllo che ci sia abbastanza stock
      if (cartItem.quantity > dbProduct.stock) {
        return res.status(400).json({
          error: `Stock insufficiente per "${dbProduct.name}" (disponibili: ${dbProduct.stock})`,
        });
      }

      total += parseFloat(dbProduct.price) * cartItem.quantity;
    }

    // se c'e' un coupon lo controllo e applico lo sconto
    if (coupon_code) {
      const couponSql = `SELECT * FROM coupons WHERE code = ?`;

      connection.query(couponSql, [coupon_code], (err, couponResults) => {
        if (err)
          return res.status(500).json({
            error: true,
            message: "Database error",
          });

        if (couponResults.length === 0) {
          return res.status(404).json({ error: "Coupon non trovato" });
        }

        const coupon = couponResults[0];
        const now = new Date().getTime();
        const validFrom = new Date(coupon.valid_from).getTime();
        const validTo = new Date(coupon.valid_to).getTime();

        // controllo date
        if (now < validFrom || now > validTo) {
          return res
            .status(400)
            .json({ error: "Coupon scaduto o non ancora attivo" });
        }

        // controllo totale minimo
        if (coupon.min_cart_amount !== null && total < coupon.min_cart_amount) {
          return res.status(400).json({ error: "Totale minimo non raggiunto" });
        }

        // applico lo sconto
        total = Math.max(0, total - parseFloat(coupon.value));

        insertOrder(coupon.id, total);
      });
    } else {
      insertOrder(null, total);
    }

    // funzione interna che salva l'ordine e i suoi prodotti
    async function insertOrder(coupon_id, finalTotal) {
      // genero un codice ordine semplice
      const order_code = `BD-${Date.now()}`;

      const insertOrderSql = `
                INSERT INTO orders
                (coupon_id, order_code, user_full_name, email, phone_number, address, zipcode, city, country, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      const orderValues = [
        coupon_id,
        order_code,
        user_full_name,
        email,
        phone_number || null,
        address,
        zipcode,
        city,
        country,
        finalTotal,
      ];

      connection.query(insertOrderSql, orderValues, (err, results) => {
        if (err)
          return res.status(500).json({
            error: true,
            message: "Database error",
          });

        const order_id = results.insertId;

        // inserisco i prodotti dell'ordine in order_product
        const itemsValues = products.map((p) => [order_id, p.id, p.quantity]);
        const itemsSql = `INSERT INTO order_product (order_id, product_id, quantity) VALUES ?`;

        connection.query(itemsSql, [itemsValues], async (err) => {
          if (err)
            return res.status(500).json({
              error: true,
              message: "Database error",
            });

          // aggiorno lo stock di ogni prodotto
          const updateStockSql = `UPDATE products SET stock = stock - ? WHERE id = ?`;
          products.forEach((p) => {
            connection.query(updateStockSql, [p.quantity, p.id], (err) => {
              if (err) console.error("Errore aggiornamento stock:", err);
            });
          });

          // preparo la lista prodotti da mettere nella mail
          const itemsList = products.map((p) => {
            const dbProduct = productResults.find((dp) => dp.id === p.id);
            return { name: dbProduct.name, quantity: p.quantity };
          });

          const mailPayload = {
            email,
            user_full_name,
            order_code,
            total: finalTotal,
            items: itemsList,
          };

          // mail al cliente
          try {
            await sendOrderConfirmation(mailPayload);
          } catch (mailErr) {
            console.error("Errore invio mail cliente:", mailErr);
          }

          res.status(201).json({
            message: "Ordine creato",
            order_id,
            order_code,
            total: finalTotal,
          });

          // mail admin
          (async () => {
            try {
              await delay(10000);
              await sendAdminOrderConfirmation(mailPayload);
            } catch (mailErr) {
              console.error("Errore invio mail admin:", mailErr);
            }
          })();
        });
      });
    }
  });
};

module.exports = { show, store };
