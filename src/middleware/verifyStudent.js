import verifyToken from "./verifyToken.js";
import authorizeRole from "./authorizeRole.js";

// Challenge 2 named middleware: verifyToken + student role check.
const verifyStudent = [verifyToken, authorizeRole("student")];

export default verifyStudent;
export { verifyStudent };
