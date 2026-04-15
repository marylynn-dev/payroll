const router = require("express").Router();
const {
  create,
  list,
  getOne,
  update,
  del,
  approveAccess,
  getPendingRequests,
} = require("../controllers/employee");
const roles = require("../middleware/roles");
const { verifyAccessToken } = require("../middleware/jwt");

router.post("/", verifyAccessToken, roles(["admin", "hr"]), create);
router.get("/", verifyAccessToken, roles(["admin", "hr"]), list);
router.get(
  "/pending-requests",
  verifyAccessToken,
  roles(["admin", "hr"]),
  getPendingRequests,
);
router.put(
  "/approve-access/:id",
  verifyAccessToken,
  roles(["admin", "hr"]),
  approveAccess,
);
router.get("/:id", verifyAccessToken, getOne);
router.put("/:id", verifyAccessToken, roles(["admin", "hr"]), update);
router.delete("/:id", verifyAccessToken, roles(["admin", "hr"]), del);

module.exports = router;
