const express = require("express");
const { create, list, remove } = require("../controllers/alertController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);
router.post("/", create);
router.get("/", list);
router.delete("/:id", remove);
module.exports = router;
