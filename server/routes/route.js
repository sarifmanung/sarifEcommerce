const express = require("express");
const router = express.Router();
const path = require("path");

const adminController = require("../controllers/adminController");
const userController = require("../controllers/userController");
const scanController = require("../controllers/scanController");
const otherController = require("../controllers/otherController");
const productController = require("../controllers/productController");

// Routes

//Product Controller

router.get("/product", productController.productPage);
// editproduct
router.get("/editproduct/:id", productController.editProduct);
// editproduct
router.post("/editproduct/:id", productController.update);

// Admin Controller
router.get("/", adminController.login_Page);
router.post("/auth", adminController.auth);
router.get("/add_admin", adminController.add_admin_Page);
router.post("/add_admin", adminController.create);
router.get("/admin-list", adminController.show_admin_page);
router.get("/viewadmin/:id", adminController.admin_Page);
router.get("/delete-admin/:id", adminController.delete);
router.get("/editadmin/:id", adminController.edit_admin_Page);
router.post("/editadmin/:id", adminController.update);
router.get("/display-hide-admin", adminController.hideAdmin_Page);
router.get("/restore-admin/:id", adminController.restore);
router.get("/white_list", adminController.white_list);
router.post("/search_staff", adminController.search_staff);
router.post("/search_white_list", adminController.search_white_list);

// User Controller
router.get("/home", userController.showusers_Page);
router.post("/search_customer", userController.search_customer);
router.get("/adduser", userController.add_Page);
router.post("/adduser", userController.create);
router.get("/edituser/:id", userController.edit_Page);
router.post("/edituser/:id", userController.update);
router.get("/viewuser/:id", userController.user_Page);
router.get("/delete/:id", userController.delete);
router.get("/restore/:id", userController.restore);
router.get("/display-hide-user", userController.hideUser_Page);
router.get("/test_format_date", userController.test_date_format);

// Handler Scan and other
// router.get('/scan-page', scanController.scan_Page);
router.get("/scanner", scanController.scanner);
router.get("/new_scanner", scanController.new_scanner);
router.get("/decodedText/:decodedText", scanController.decodedText);
router.get("/404", scanController.wrongUrl);
router.get("/exit", scanController.exit);
// router.get('/robots.txt', scanController.robots);

// Handler Other thing
router.get("/register", otherController.register_Page);
router.get("/register/thank-you", otherController.register_thanks_you);
router.post("/register", otherController.register_create);

// header & footer
router.get("/header", otherController.header_page);

// IF Wrong URL
router.use("*", (req, res) => {
    // redirect to 404 in future
    res.status(404).redirect("/404");
});

module.exports = router;