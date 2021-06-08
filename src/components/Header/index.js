import "./style.css";
import { Button } from "@material-ui/core";

export default function Header(props) {
  return (
    <header>
      <div className='logo'>
        <i className='fas fa-virus-slash'></i>
        <h3>Passaporte Covid</h3>
      </div>

      {props.registered && (
        <div className='botoes'>
          <Button
            style={{ color: "white" }}
            onClick={() => props.setModalAberto(true)}
          >
            {" "}
            PERMISSÃO{" "}
          </Button>
          <Button style={{ color: "white" }} onClick={() => props.logout()}>
            {" "}
            LOGOUT{" "}
          </Button>
        </div>
      )}
    </header>
  );
}
