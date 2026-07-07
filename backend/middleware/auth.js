import jwt from "jsonwebtoken"

const authMiddleware = async (req, res, next) => {
    try {
        req.body = req.body || {};

        const token = req.headers.token || req.headers.authorization || req.headers.Authorization;
        if (!token) {
            return res.json({ success: false, message: "Not Authorised Login Again" });
        }

        const cleanToken = typeof token === "string" && token.startsWith("Bearer ")
            ? token.slice(7)
            : token;

        const token_decode = jwt.verify(cleanToken, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export default authMiddleware;