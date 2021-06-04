import "./style.css";
import { useState, useRef } from "react";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";
import { TextField } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import abi from "../../utils/abi.json";
import contractAddress from "../../utils/contractAddress.json";
import Web3 from "web3";

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const contrato = new web3.eth.Contract(abi, contractAddress.address);

export default function Modal(props) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [invalidInput, setInvalidInput] = useState(false);

  const handleSubmit = async e => {
    if (e.key !== "Enter") return;
    setError(false);
    setSuccess(false);
    setInvalidInput(false);
    if (props.input.length === 0) {
      return;
    }
    if (props.input.length !== 42) {
      setInvalidInput(true);
      return;
    }
    if (props.input.substr(0, 2) !== "0x") {
      setInvalidInput(true);
      return;
    }

    //TODO
    //dar permissao ao adm
    /*
    console.log(props.userData.address);
    await web3.eth.personal
      .unlockAccount(props.userData.address, props.userData.name, 10000)
      .catch(console.log)
      .then(() => console.log("deu certo"));

    const momento = new Date().getTime();
    await contrato.methods
      .permitirAdministrador(input, momento)
      .send({ from: props.userData.address })
      .catch(data => {
        console.log(data);
        setSuccess(true);
      })
      .then(e => {
        console.log(e);
        setError(true);
      });
      */
  };

  return (
    <div className='overlay'>
      <div className='modal'>
        <button onClick={() => props.setModalAberto(false)}>&#215;</button>
        <h2>Permitir um funcionário de saúde</h2>
        <SupervisedUserCircleIcon
          style={{ fontSize: "220px", color: "cornflowerblue" }}
        />
        <TextField
          id='standard-basic'
          label='Endereço'
          style={{ width: "90%" }}
          onKeyPress={handleSubmit}
          value={props.input}
          onChange={e => props.setInput(e.target.value)}
        />
        <div className='mensagens'>
          {success && (
            <MuiAlert elevation={6} variant='filled' severity='success'>
              Permissão concedida com sucesso. O profissional terá acesso aos
              seus dados por 1 hora.
            </MuiAlert>
          )}
          {error && (
            <MuiAlert elevation={6} variant='filled' severity='error'>
              Ocorreu um erro ao permitir o profissional.
            </MuiAlert>
          )}
          {invalidInput && (
            <MuiAlert elevation={6} variant='filled' severity='error'>
              Endereço inválido.
            </MuiAlert>
          )}
        </div>
      </div>
    </div>
  );
}
