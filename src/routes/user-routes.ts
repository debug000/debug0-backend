const router = require("express").Router();

//middleware
const authCheck = require("../middleware/auth-check");

//controller
const userController = require("../controllers/user-controller");

router.use(authCheck);

// GET

router.get("/", userController.sendUserDetails);

// POST
router.post("/updateUserPR", userController.updatePullRequestsForAllUsers);


export {};

module.exports = router;
