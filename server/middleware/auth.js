import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Acceso no autorizado." });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Sesion invalida o expirada." });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.rol !== "admin") {
    return res.status(403).json({ message: "Solo el administrador puede realizar esta accion." });
  }

  next();
}
