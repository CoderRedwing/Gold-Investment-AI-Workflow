const express = require("express");
const { create, list, toggle, remove } = require("../controllers/sipController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);
router.post("/", create);
router.get("/", list);
router.patch("/:id/toggle", toggle);
router.delete("/:id", remove);
module.exports = router;
