const router = require("express").Router();

//controller
const authController = require("../controllers/auth-controller");

// POST

router.post("/auth", authController.userGitHubAuthorization);

export {};

module.exports = router;
