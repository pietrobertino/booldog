const connection = require("../data/db");

// index - restituisce la lista di tutti i brand ordinati per nome
const index = (req, res) => {
  const sql = `SELECT id, name, slug, logo_url FROM brands ORDER BY name`;

  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: "Database error",
      });
    }

    res.json(results);
  });
};

module.exports = { index };
