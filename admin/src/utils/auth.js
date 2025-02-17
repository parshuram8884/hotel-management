export const verifyAdminCredentials = (username, password) => {
  const validUsername = "admin";
  const validPassword = "admin123";
  return username === validUsername && password === validPassword;
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

export const setAdminAuth = () => {
  const expiryTime = Date.now() + (30 * 60 * 1000); // 30 minutes
  sessionStorage.setItem('adminAuthExpiry', expiryTime.toString());
};
