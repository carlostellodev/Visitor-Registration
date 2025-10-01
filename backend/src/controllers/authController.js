import authService from "../services/authService.js";

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

    const result = await authService.register({
      name,
      email,
      password,
      tenantId,
    });

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
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son requeridos",
      });
    }

    const result = await authService.login({ email, password });

    res.json({
      message: "Login exitoso",
      ...result,
    });
  } catch (error) {
    // Error conocido (credenciales inválidas)
    if (error.message === "Credenciales inválidas") {
      return res.status(401).json({ message: error.message });
    }

    // Error del servidor
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
