// src/utils/auth.js

export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUserRole = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  return JSON.parse(user).role;
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};
