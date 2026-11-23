import verifyToken from "./verifyToken.js";
import authorizeRole from "./authorizeRole.js";

// Challenge 2 named middleware: verifyToken + tutor role check.
const verifyTutor = [verifyToken, authorizeRole("tutor")];

export default verifyTutor;
export { verifyTutor };
