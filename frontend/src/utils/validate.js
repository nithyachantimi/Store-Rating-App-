export const validatePassword = (password = "") => {
  const errors = [];
  if (password.length < 8 || password.length > 16) {
    errors.push("Password must be 8–16 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter.");
  }
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    errors.push("Password must include at least one special character.");
  }
  return { isValid: errors.length === 0, errors, message: errors[0] || "Password is valid." };
};

export const validateName = (name = "") => {
  const value = name.trim();
  if (value.length < 20 || value.length > 60) {
    return { isValid: false, message: "Name must be between 20 and 60 characters." };
  }
  return { isValid: true, message: "" };
};

export const validateAddress = (address = "") => {
  const value = address.trim();
  if (!value) return { isValid: false, message: "Address is required." };
  if (value.length > 400) {
    return { isValid: false, message: "Address must be 400 characters or fewer." };
  }
  return { isValid: true, message: "" };
};

export const validateEmail = (email) => {
  const value = typeof email === "string" ? email.trim() : "";
  const isValid =
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
    !value.includes("..");
  return {
    isValid,
    errors: isValid ? [] : ["Please enter a valid email address."],
    message: isValid ? "Email is valid." : "Please enter a valid email address.",
    normalizedEmail: isValid ? value.toLowerCase() : null,
  };
};
