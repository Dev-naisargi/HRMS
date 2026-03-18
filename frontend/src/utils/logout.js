import { googleLogout } from "@react-oauth/google";

export const logoutUser = () => {
  googleLogout();
  localStorage.removeItem("token");
};
