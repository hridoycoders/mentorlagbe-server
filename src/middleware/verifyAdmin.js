import verifyToken from "./verifyToken.js";
import authorizeRole from "./authorizeRole.js";

// Challenge 2 named middleware: verifyToken + admin role check.
const verifyAdmin = [verifyToken, authorizeRole("admin")];

export default verifyAdmin;
export { verifyAdmin };
