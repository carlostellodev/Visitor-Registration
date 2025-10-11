import authService from "../services/authService.js";

// Función de sanitización
const sanitizeInput = (input) => {
  if (!input || typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>\"'%;()&+]/g, "")
    .slice(0, 200);
};

export const register = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    if (!name || !email || !password || !tenantId) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const result = await authService.register(req.body);

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      ...result,
    });
  } catch (error) {
    if (
      error.message === "El email ya está registrado" ||
      error.message === "Tenant no encontrado" ||
      error.message === "El tenant no está activo"
    ) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Controlador de login
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = sanitizeInput(email)?.toLowerCase();
    password = password?.trim();

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son requeridos",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Formato de email inválido",
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({
        message: "Contraseña inválida",
      });
    }

    // Obtener IP del cliente
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.socket.remoteAddress ||
      req.connection.remoteAddress ||
      "unknown";

    const result = await authService.login({
      email,
      password,
      ipAddress,
    });

    res.json({
      message: "Login exitoso",
      ...result,
    });
  } catch (error) {
    // Error de rate limiting (429)
    if (error.statusCode === 429) {
      return res.status(429).json({
        message: error.message,
        details: error.details,
        lockedUntil: error.lockedUntil,
      });
    }

    // Error credenciales inválidas
    if (error.message === "Credenciales inválidas") {
      return res.status(401).json({
        message: error.message,
        hint: "Verifica tu email y contraseña",
      });
    }

    // Error de usuario o tenant inactivo
    if (
      error.message === "Usuario inactivo" ||
      error.message === "Tenant inactivo"
    ) {
      return res.status(403).json({
        message: error.message,
        hint: "Contacta con el administrador",
      });
    }
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// Controlador para obtener perfil
export const getUser = async (req, res) => {
  try {
    const user = await authService.getUserById(req.userId);
    res.json({ user });
  } catch (error) {
    // Error conocido (usuario no encontrado)
    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    // Error del servidor
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};
