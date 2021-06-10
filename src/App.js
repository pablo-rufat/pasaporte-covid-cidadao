import "./App.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Web3 from "web3";
import { format } from "date-fns";
import { name, br, date } from "faker-br";
import { Auth, API, graphqlOperation } from "aws-amplify";
import { getCidadao } from "./graphql/queries";
import MuiAlert from "@material-ui/lab/Alert";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";
import {
  TextField,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from "@material-ui/core";
import abi from "./utils/abi.json";
import contractAddress from "./utils/contractAddress.json";
import QRCode from "qrcode.react";
import { createCidadao } from "./graphql/mutations";

const web3 = new Web3(new Web3.providers.HttpProvider("http://3.80.126.126:8545"));
const contrato = new web3.eth.Contract(abi, contractAddress.address);

function App() {
  const [userData, setUserData] = useState(null);
  const [vacinas, setVacinas] = useState([0, 0]);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [input, setInput] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [invalidInput, setInvalidInput] = useState(false);

  useEffect(() => {
    console.log("fetch user");
    const fetchUser = async () => {
      setLoading(true);
      const currentUser = await Auth.currentAuthenticatedUser({
        bypassCache: true,
      });

      if (currentUser && !userData) {
        const apiResponse = await API.graphql(
          graphqlOperation(getCidadao, {
            id: currentUser.attributes.sub,
          })
        ).catch(console.log());
        const info = apiResponse.data.getCidadao;

        if (!info) setAddUser(true);
        else {
          console.log("entrou");
          console.log(info);
          setAddUser(false);
          setUserData(info);
          await web3.eth.personal
            .unlockAccount(info.address, info.name, 10000)
            .catch(console.log);
        }
      }
      setLoading(false);
    };
    if (!userData) {
      fetchUser();
    }
  }, []);

  useEffect(() => {
    console.log("save db");
    const saveDB = async () => {
      if (addUser) {
        const currentUser = await Auth.currentAuthenticatedUser({
          bypassCache: true,
        });
        const nome = name.findName();
        const cpf = String(br.cpf());
        const contas = await web3.eth.getAccounts();
        const newAccount = await web3.eth.personal.newAccount(nome);
        web3.eth.defaultAccount = newAccount;
        console.log("newAccount", newAccount);
        await web3.eth.getBalance(contas[0], (err, bal) => {
          if (err) throw err;
          console.log("Ganache balance", bal);
        });
        await web3.eth.sendTransaction({
          to: newAccount,
          from: contas[0],
          value: web3.utils.toWei("1", "ether"),
        });
        await web3.eth.getBalance(newAccount, (err, bal) => {
          if (err) throw err;
          console.log("New Account balance", bal);
        });

        const data = date.past();
        if (data.getYear() >= 1965) {
          data.setYear(1965 + Math.floor(Math.random() * 6));
        }
        const dataFormatada = format(data, "dd/MM/yyyy");

        const userInfo = {
          id: currentUser.attributes.sub,
          address: newAccount,
          name: nome,
          cpf: cpf,
          dataNascimento: dataFormatada,
        };
        console.log(userInfo);

        await API.graphql(
          graphqlOperation(createCidadao, {
            input: {
              ...userInfo,
            },
          })
        ).catch(console.log);

        console.log("SALVO NO BD");

        try {
          await web3.eth.personal
            .unlockAccount(newAccount, nome, 10000)
            .catch(console.log);
          await contrato.methods
            .cadastrarCidadao()
            .send({ from: userInfo.address })
            .catch(e => console.log(e))
            .then(() => console.log("Cadastrado"));
        } catch (error) {
          console.log(error);
        }

        setUserData(userInfo);
      }
    };
    if (!userData) {
      saveDB();
    }
  }, [addUser]);

  useEffect(() => {
    console.log("interval");
    if (vacinas[0] === 0 || vacinas[1] === 0) {
      const intervalId = setInterval(async () => {
        try {
          if (userData) {
            const momento = new Date();
            const vacinasTime = await contrato.methods
              .getHistoricoDatasVacinas(userData.address, momento.getTime())
              .call({ from: userData.address })
              .catch(e => {
                console.log(e);
              });
            setVacinas([Number(vacinasTime[0]), Number(vacinasTime[1])]);
            console.log(vacinasTime[0], vacinasTime[1]);
          }
        } catch (error) {
          console.log(error);
        }
      }, 2000);

      return () => {
        clearInterval(intervalId);
      };
    }
  });

  const logout = async () => {
    setLoading(true);
    try {
      setUserData(null);
      setVacinas([0, 0]);
      setAddUser(false);
      setModalAberto(false);
      await Auth.signOut();
      window.location.reload();
    } catch (error) {
      console.log("error signing out: ", error);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleSubmit = async e => {
    console.log(input);
    if (e.key !== "Enter") return;
    setError(false);
    setSuccess(false);
    setInvalidInput(false);
    if (input.length === 0) {
      return;
    }
    if (input.length !== 42) {
      setInvalidInput(true);
      return;
    }
    if (input.substr(0, 2) !== "0x") {
      setInvalidInput(true);
      return;
    }
    try {
      const momento = new Date();
      await contrato.methods
        .permitirAdministrador(input, momento.getTime())
        .send({ from: userData.address })
        .then(data => {
          console.log(data);
          setSuccess(true);
        })
        .catch(e => {
          console.log(e);
          setError(true);
          setSuccess(false);
        });
    } catch (error) {
      console.log(error);
      setError(true);
    }
  };

  return (
    <div className='App'>
      <Header
        setModalAberto={setModalAberto}
        registered={!!userData}
        logout={logout}
      />
      {modalAberto && (
        <div className='overlay'>
          <div className='modal'>
            <button onClick={() => setModalAberto(false)}>&#215;</button>
            <h2>Permitir um funcionário de saúde</h2>
            <SupervisedUserCircleIcon
              style={{
                fontSize: "220px",
                color: "cornflowerblue",
                alignSelf: "center",
              }}
            />
            <TextField
              id='standard-basic'
              label='Endereço'
              style={{ width: "100%" }}
              onKeyPress={handleSubmit}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <div className='mensagens'>
              {success && (
                <MuiAlert elevation={6} variant='filled' severity='success'>
                  Permissão concedida com sucesso. O profissional terá acesso
                  aos seus dados por 1 hora.
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
      )}

      {userData && (
        <main>
          <Card className='card'>
            {loading && (
              <div className='loading'>
                <CircularProgress />
              </div>
            )}
            <CardHeader
              className='cardInfo'
              title={userData ? userData.name : ""}
              subheader={
                userData
                  ? `${userData.cpf.substr(0, 3)}.${userData.cpf.substr(
                      3,
                      3
                    )}.${userData.cpf.substr(6, 3)}-${userData.cpf.substr(
                      9,
                      2
                    )}`
                  : ""
              }
            />
            <CardContent>
              <QRCode value={userData.address} className='qrcode' />
              <List className='cardInfo'>
                <ListItem className='cardInfo'>
                  <ListItemText
                    className='cardInfo'
                    primary='Primeira dose'
                    secondary={
                      userData && vacinas[0] !== 0
                        ? format(vacinas[0], "dd/MM/yyyy HH:mm")
                        : "Ainda nada"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary='Primeira dose'
                    secondary={
                      userData && vacinas[1] !== 0
                        ? format(vacinas[1], "dd/MM/yyyy HH:mm")
                        : "Ainda nada"
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Tooltip title='Copiar endereço'>
                <Button
                  size='small'
                  color='primary'
                  onClick={() =>
                    navigator.clipboard.writeText(
                      userData ? userData.address : ""
                    )
                  }
                >
                  {userData ? userData.address : ""}
                </Button>
              </Tooltip>
            </CardActions>
          </Card>
        </main>
      )}
      <Footer />
    </div>
  );
}

export default withAuthenticator(App);
