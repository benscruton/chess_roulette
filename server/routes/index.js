const router = require("express").Router();
const path = require("path");

const gameRoutes = require("./game.routes");
const userRoutes = require("./user.routes");
const authRoutes = require("./auth.routes");

router.use("/api/games", gameRoutes);
router.use("/api/users", userRoutes);
router.use("/api", authRoutes);

router.use( (req, res) => {
	res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

module.exports = router;