export const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const isValidEmail = (value) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const validatePassword = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  password.length <= 16 &&
  /[A-Z]/.test(password) &&
  /[^A-Za-z0-9\s]/.test(password);

export const validateUserFields = ({ name, email, password, address }) => {
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = normalizeEmail(email);
  const cleanAddress = typeof address === "string" ? address.trim() : "";
  const errors = {};

  if (cleanName.length < 20 || cleanName.length > 60) {
    errors.name = "Name must be between 20 and 60 characters.";
  }
  if (!isValidEmail(cleanEmail)) errors.email = "Enter a valid email address.";
  if (!cleanAddress || cleanAddress.length > 400) {
    errors.address = "Address is required and must be 400 characters or fewer.";
  }
  if (!validatePassword(password)) {
    errors.password =
      "Password must be 8–16 characters and include an uppercase letter and a special character.";
  }

  return {
    errors,
    value: {
      name: cleanName,
      email: cleanEmail,
      password,
      address: cleanAddress,
    },
  };
};
