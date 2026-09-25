const connection = require("../data/db")

const index = (req, res) => {

    //salvo l'ordine passato nell'url e il search
    const { sort, search } = req.query;

    let orderQuery = `p.created_at DESC`;

    switch (sort) {
        //modifico la query string sulla base dell'ordine selezionato
        case "price-up":
            orderQuery = `p.price`;
            break;
        case "price-down":
            orderQuery = `p.price DESC`;
            break;
        case "name":
            orderQuery = `p.name`;
            break;
        default:
            //nel caso default, che è anche quello iniziale, il sortaggio è per latest
            orderQuery = `p.created_at DESC`;
    }

    const queryParams = [];

    let sql = `
    SELECT 
    p.id,
    p.slug,
    p.name,
    p.description,
    p.price,
    p.color,
    p.material,
    p.size,
    p.stock,
    p.img_url,
    p.category,
    p.is_featured,
    p.created_at,
    b.name AS brand_name,
    b.slug AS brand_slug,
    a.name AS animal_name,
    a.slug AS animal_slug
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    JOIN animal_types a ON a.id = p.animal_type_id`;

    if (search && search.trim() !== "") {
        sql += ` WHERE p.name LIKE ?`;
        queryParams.push(`%${search}%`);
    }

    sql += ` ORDER BY ${orderQuery}`;

    connection.query(sql, queryParams, (err, results) => {

        if (err) return res.status(500).json({
            error: true,
            message: "Database error"
        })

        res.json(results)
    })

}

const indexAnimalType = (req, res) => {

    // prendo l'animal type passato dalla call api
    const { animalType } = req.params

    //salvo l'ordine passato nell'url e il search
    const { sort, search } = req.query;

    let orderQuery = `p.created_at DESC`;

    switch (sort) {
        //modifico la query string sulla base dell'ordine selezionato
        case "price-up":
            orderQuery = `p.price`;
            break;
        case "price-down":
            orderQuery = `p.price DESC`;
            break;
        case "name":
            orderQuery = `p.name`;
            break;
        default:
            //nel caso default, che è anche quello iniziale, il sortaggio è per latest
            orderQuery = `p.created_at DESC`;
    }

    const queryParams = [`${animalType}`];

    let sql = `
    SELECT 
    p.id,
    p.slug,
    p.name,
    p.description,
    p.price,
    p.color,
    p.material,
    p.size,
    p.stock,
    p.img_url,
    p.category,
    p.is_featured,
    p.created_at,
    b.name AS brand_name,
    b.slug AS brand_slug,
    a.name AS animal_name,
    a.slug AS animal_slug
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    JOIN animal_types a ON a.id = p.animal_type_id
     WHERE a.slug IN (?, "cane-gatto")`;

    if (search && search.trim() !== "") {
        sql += ` AND p.name LIKE ?`;
        queryParams.push(`%${search}%`);
    }

    sql += ` ORDER BY ${orderQuery}`;

    connection.query(sql, queryParams, (err, results) => {

        if (err) return res.status(500).json({
            error: true,
            message: "Database error"
        })

        res.json(results)
    })

}

const show = (req, res) => {
    const { slug } = req.params;

    // 1. Prodotto + brand + animale
    const productSql =
        `  SELECT 
      p.id,
      p.slug,
      p.name,
      p.description,
      p.price,
      p.color,
      p.material,
      p.size,
      p.stock,
      p.img_url,
      p.category,
      p.is_featured,
      p.created_at,
      b.id   AS brand_id,
      b.name AS brand_name,
      b.slug AS brand_slug,
      b.logo_url AS brand_logo,
      a.id   AS animal_id,
      a.name AS animal_name,
      a.slug AS animal_slug
    FROM products p
    JOIN brands b       ON b.id = p.brand_id
    JOIN animal_types a ON a.id = p.animal_type_id
    WHERE p.slug = ?
    LIMIT 1`
        ;


    connection.query(productSql, [slug], (err, productResults) => {

        if (err) return res.status(500).json({
            error: true,
            message: "Database error err"
        })

        if (productResults.length === 0) {
            return res.status(404).json({ error: "Prodotto non trovato" });
        }

        const product = productResults[0];



        // 3. Prodotti correlati
        const relatedSql =
            ` SELECT 
            p.slug,
            p.id,
            p.name,
            p.price,
            p.category,
            p.img_url,
            b.name AS brand_name,
            a.id   AS animal_id,
            a.name AS animal_name
        FROM products p
        JOIN brands b ON b.id = p.brand_id
        JOIN animal_types a ON a.id = p.animal_type_id
        WHERE p.id != ?
          AND (p.brand_id = ? OR p.category = ?)
        ORDER BY RAND()
        LIMIT 4`
            ;

        connection.query(relatedSql, [product.id, product.brand_id, product.category], (err, relatedResults) => {

            if (err) return res.status(500).json({
                error: true,
                message: "Database error"
            })

            // 4. Compongo la risposta finale
            res.json({
                ...product,
                related: relatedResults,
            });
        }
        );
    });
    ;
}

module.exports = { index, show, indexAnimalType }