import "../../assets/scss/User.scss";
import 'react-toastify/dist/ReactToastify.css';
import notfound from "../../assets/images/notfound.webp"
const NotFound = () => {
  return (
    <div className="app-container notfound">
      <img className="notfound" src={notfound} />
    </div>
  );
};

export default NotFound;
