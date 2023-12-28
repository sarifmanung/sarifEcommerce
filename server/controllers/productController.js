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
        `SELECT * FROM calendar_products`,
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