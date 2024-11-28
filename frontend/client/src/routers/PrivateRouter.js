import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
const PrivateRoute = (props) => {
  var isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const userRole = useSelector((state) => state.user.role);
  console.log("User Role:", userRole)

  if(!isAuthenticated) {
    return <Navigate to="/Login"></Navigate>
  }
  
  return (
    <>
    {props.children}
    </>
  )
}

export default PrivateRoute;