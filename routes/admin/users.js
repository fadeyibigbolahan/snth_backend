const express = require("express");

const {} = require("../../controllers/admin/order-controller");

const router = express.Router();

router.get("/get", getAllOrdersOfAllUsers);

module.exports = router;
