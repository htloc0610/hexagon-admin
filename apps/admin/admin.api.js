const express = require("express");
const adminController = require("./adminController");
const ensureAuthenticated = require("./middleware/ensureAuthenticated");

const router = express.Router();

// API route to fetch paginated accounts
router.get("/api/accounts", ensureAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const accounts = await adminController.getPaginatedAccounts(offset, limit);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
