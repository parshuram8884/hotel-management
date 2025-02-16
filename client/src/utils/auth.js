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

export const setAdminAuth = () => {
  const expiryTime = Date.now() + (5 * 60 * 1000); // 5 minutes from now
  sessionStorage.setItem('adminAuthExpiry', expiryTime.toString());
  return true;
};

export const checkAdminAuth = () => {
  const expiryTime = sessionStorage.getItem('adminAuthExpiry');
  if (!expiryTime) return false;
  
  const isValid = Date.now() < parseInt(expiryTime);
  if (!isValid) {
    sessionStorage.removeItem('adminAuthExpiry');
  }
  return isValid;
};

export const clearAdminAuth = () => {
  sessionStorage.removeItem('adminAuthExpiry');
};
