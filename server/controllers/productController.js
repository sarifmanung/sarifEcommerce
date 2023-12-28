let {
    countTotalRows,
    hashPassword,
    comparePassword,
    actionsLog,
} = require("./utils.js");
const mysql = require("mysql");
const path = require("path");

// Connection Pool
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// date_format
function Date_format(date) {
    const mydate = date;
    const yyyy = mydate.getFullYear();
    let mm = mydate.getMonth() + 1; // Months start at 0!
    let dd = mydate.getDate();
    // if
    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    // result
    const formattedToday = yyyy + "-" + mm + "-" + dd;
    // return back
    return formattedToday;
}
exports.shoppingPage = async(req, res) => {
    // res.render("myshop")

    connection.query(
        `SELECT * FROM calendar_products where stock_quantity > 0`,
        (err, rows) => {
            // When done with the connection, release it
            if (!err) {
                res.render("myshop", { rows });
            } else {
                console.log(err);
            }
        }
    );
};

// update order table
exports.apiOrders = async(req, res) => {

    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    // Connect to the database
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err.message);
            return;
        }
        console.log('Connected to the database');

        const { quantity1, quantity2, quantity3, quantity4 } = req.body;

        // Check if any of the quantities have valid data
        if (quantity1 || quantity2 || quantity3 || quantity4) {
            // Begin a transaction
            connection.beginTransaction((transactionErr) => {

                if (transactionErr) throw transactionErr;

                try {
                    // Process each product quantity if it has valid data
                    const productQuantities = [quantity1, quantity2, quantity3, quantity4];
                    const orderItems = [];

                    for (let i = 0; i < productQuantities.length; i++) {
                        const quantity = productQuantities[i];

                        if (quantity) {
                            const productId = i + 1; // product_id starts from 1
                            const productQuantity = parseInt(quantity, 10); // quantity is a string, convert it to an integer
                            const productPrice = getProductPrice(productId);

                            // Update stock quantity for the current product
                            connection.query('UPDATE calendar_products SET stock_quantity = stock_quantity - ? WHERE product_id = ?', [productQuantity, productId], (updateErr) => {
                                if (updateErr) throw updateErr;

                                // Add order item for the current product
                                orderItems.push({ order_id: 0, product_id: productId, quantity: productQuantity, price: productPrice });

                                // * If this is the last product, proceed with inserting the order and order items
                                if (i === productQuantities.length - 1) {
                                    const total_price = calculateTotalPrice(orderItems);
                                    const order = { user_id: 1, total_price };

                                    // Insert a new order into the orders table
                                    connection.query('INSERT INTO orders SET ?', order, (insertErr, result) => {
                                        if (insertErr) {
                                            throw insertErr;
                                        }

                                        // Update order_id for each order item
                                        orderItems.forEach((item) => {
                                            item.order_id = result.insertId;
                                        });

                                        // Insert order items into the order_items table
                                        for (const item of orderItems) {
                                            connection.query('INSERT INTO order_items SET ?', item, (insertItemErr) => {
                                                if (insertItemErr) {
                                                    throw insertItemErr;
                                                }
                                            });
                                        }

                                        // Commit the transaction
                                        connection.commit((commitErr) => {
                                            if (commitErr) {
                                                throw commitErr;
                                            }

                                            console.log('Transaction committed successfully');
                                            connection.end(); // Close the database connection
                                            res.send("ok")
                                        });
                                    });
                                }
                            });
                        }
                    }
                } catch (error) {
                    // If any error occurs, rollback the transaction
                    connection.rollback(() => {
                        console.error('Transaction rolled back due to an error:', error.message);
                        connection.end(); // Close the database connection
                    });
                }
            });
        } else {
            // No valid quantities provided, handle accordingly (send response, throw error, etc.)
            console.log('No valid quantities provided.');
            res.status(400).json({ error: 'No valid quantities provided.' });
        }
    });

    // Function to calculate the total price based on order items
    function calculateTotalPrice(orderItems) {
        return orderItems.reduce((total, item) => total + item.quantity * item.price, 0);
    }

    function getProductPrice(product_id) {
        switch (product_id) {
            case 1:
                return 100.00;
            case 2:
                return 80.00;
            case 3:
                return 10.00;
            case 4:
                return 50.00;

            default:
                return 0.00;
        }
    }

};

exports.ordersSummaryPage = async(req, res) => {}
exports.productPage = async(req, res) => {


    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        return res.redirect("/");
    }

    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("\nyou role : " + req.session.role + "\n");
        console.log("merchant can only use scanner");
        console.log("redirect to scanner page");
        return res.redirect("/scan-page");
    }

    // take data utilities
    let removedUser = req.query.removed;
    let restore = req.query.restored;
    let info = req.query.info;
    let hidestaff = req.session.role == "merchant";
    let alerted = req.query.alert;
    hidePagination = false;

    // if login success
    if (info) console.log("\nyou role : " + req.session.role + "\n");

    if (!req.session.total_user) {
        try {
            const count = await countTotalRows("customer");
            // keep the amount of total user
            req.session.total_user = count;
        } catch (err) {
            console.error("Error:", err);
        }
    }

    const perPage = 20;
    const currentPage = parseInt(req.query.page || 1);
    const offset = (currentPage - 1) * perPage;
    const lastPage = Math.ceil(req.session.total_user / perPage);

    if (currentPage > 0 && currentPage <= lastPage) {
        // User the connection
        connection.query(
            `SELECT * FROM calendar_products`,
            (err, rows) => {
                // When done with the connection, release it
                if (!err) {
                    res.render("product_page", {
                        rows,
                        lastPage,
                        removedUser,
                        restore,
                        info,
                        hidestaff,
                        alerted,
                        hidePagination,
                    });
                } else {
                    console.log(err);
                }
                console.log("\nmembership page ", currentPage, "\n");
            }
        );
    } else {
        // res.redirect("/home");
    }
};

exports.editProduct = async(req, res) => {
    // take data utilities
    let check = req.query.check;
    let hidestaff = req.session.role == "merchant";
    // User the connection
    connection.query(
        "SELECT * FROM calendar_products WHERE product_id = ?", [req.params.id],
        (err, rows) => {
            if (!err) {
                res.render("edit-product", {
                    rows,
                    check,
                    hidestaff,
                });
            } else {
                console.log(err);
            }
            console.log("\nedit page\n id : " + [req.params.id]);
            // console.log('The data from user table: \n', rows);
        }
    );
}

exports.update = async(req, res) => {

    const { product_name, price, stock_quantity, description } = req.body

    connection.query(
        "UPDATE calendar_products SET product_name = ?, price = ?, stock_quantity = ?, description = ?  WHERE product_id = ?", [
            product_name, price, stock_quantity, description, req.params.id,
        ],
        (err, rows) => {

            if (!err) {
                return res.redirect("/product");
            } else {
                console.error(err);
            }
        }
    );
}

exports.cart = async(req, res) => {
    res.render("cart")


};