const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/UserModel");

const JWT_SECRET = process.env.JWT_SECRET || "playnow-dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const ADMIN_EMAIL = "admin@playnow.com";
const ADMIN_PASSWORD = "Admin@12345";
const ADMIN_FULL_NAME = "System Admin";

const mapRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "coach") {
    return "Coach";
  }

  return "Student";
};

const buildAuthResponse = (user) => {
  const userId = user._id ? user._id.toString() : "admin-fixed";
  const normalizedRole = user.role === "User" ? "Student" : user.role;

  const token = jwt.sign(
    {
      sub: userId,
      role: normalizedRole,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    role: normalizedRole,
    fullName: user.fullName,
    studentId: user.studentId || "",
    email: user.email,
  };
};

exports.signup = async (req, res) => {
  try {
    const { fullName, studentId, role, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (normalizedEmail === ADMIN_EMAIL) {
      return res.status(409).json({ message: "This email is reserved for system admin." });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: String(fullName).trim(),
      studentId: studentId ? String(studentId).trim() : "",
      role: mapRole(role),
      email: normalizedEmail,
      password: passwordHash,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      ...buildAuthResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Signup failed." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.status(200).json(
        buildAuthResponse({
          _id: "admin-fixed",
          role: "Admin",
          fullName: ADMIN_FULL_NAME,
          email: ADMIN_EMAIL,
        })
      );
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message || "Login failed." });
  }
};
