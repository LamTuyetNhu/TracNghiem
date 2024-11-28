// import "../../assets/scss/User.scss";
import 'react-toastify/dist/ReactToastify.css';
import notfound from "../../assets/images/notfound.webp"
import "../../App.scss"
const NotFound = () => {
  return (
    <div className="app-container notfound">
      {/* <img className="notfound" src={notfound} /> */}
      <img class="none-quiz" src="https://cf.quizizz.com/img/misc/404/locker_optim_900.gif" alt="OOPS" />
    </div>
  );
};

export default NotFound;
