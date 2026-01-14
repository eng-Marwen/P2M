import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../app/store";

// Explanation: This component protects routes - only authenticated users can access
const PrivateRoute = () => {
  // Type the selector with RootState for autocomplete
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  return (
    <>
      {currentUser ? (
        <Outlet /> // Render child routes if logged in
      ) : (
        <Navigate to="/sign-in" /> // Redirect to login if not
      )}
    </>
  );
};

export default PrivateRoute;
