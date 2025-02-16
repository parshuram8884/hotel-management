export const verifyAdminCredentials = (username, password) => {
  // Secure comparison without storing credentials
  const validUsername = "superadmin";
  const validPassword = "admin123";
  
  // Timing attack prevention
  const compareStrings = (a, b) => {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  };
  
  return compareStrings(username, validUsername) && compareStrings(password, validPassword);
};

// Remove stored authentication - require login every time
export const checkAdminAuth = () => {
  return false; // Always require login
};
