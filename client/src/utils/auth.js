// Simple obfuscation technique - this is just one layer of security
const _0x5f2d = ['YWRtaW4xMjM=', 'c3VwZXJhZG1pbg==']; // Base64 encoded credentials
const _0x3d8f = atob(_0x5f2d[1]); // username
const _0x9c4e = atob(_0x5f2d[0]); // password

export const verifyAdminCredentials = (username, password) => {
  // Additional security measure - timing attack prevention
  let isValid = false;
  const compareStrings = (a, b) => {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  };
  
  isValid = compareStrings(username, _0x3d8f) && compareStrings(password, _0x9c4e);
  return isValid;
};

export const setAdminAuth = () => {
  const token = Math.random().toString(36).substring(7) + Date.now();
  sessionStorage.setItem('adminToken', token);
};

export const checkAdminAuth = () => {
  return !!sessionStorage.getItem('adminToken');
};
