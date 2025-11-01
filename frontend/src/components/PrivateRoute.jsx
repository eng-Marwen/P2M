import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  return (
    <>
      {currentUser ? (
        <Outlet />
      ) : (
        <Navigate to="/sign-in" />
      )}
    </>
  )
}

export default PrivateRoute