import "./App.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Form from "./components/Form";
import Modal from "./components/Modal";
import Web3 from "web3";
import { format } from "date-fns";
import { name, br, date } from "faker-br";
import { Auth, API, graphqlOperation } from "aws-amplify";
import { getCidadao } from "./graphql/queries";
import {
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

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const contrato = new web3.eth.Contract(abi, contractAddress);

function App() {
  const [userData, setUserData] = useState(null);
  const [vacinas, setVacinas] = useState([0, 0]);
  const [modalAberto, setModalAberto] = useState(true);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addUser, setAddUser] = useState(false);
  /*
  useEffect(() => {
    
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

    saveDB();
  }, [addUser]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (userData) {
        const momento = new Date();
        const vacinas = await contrato.methods
          .getHistoricoDatasVacinas(userData.address, momento.getTime())
          .call({ from: userData.address })
          .catch(e => {
            console.log(e);
          });
        setVacinas([Number(vacinas[0]), Number(vacinas[1])]);
        console.log(vacinas[0], vacinas[1]);
      }
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  });
*/
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

  return (
    <div className='App'>
      <Header
        setModalAberto={setModalAberto}
        registered={!!userData}
        logout={logout}
      />
      {modalAberto && <Modal setModalAberto={setModalAberto} />}

      {userData && (
        <main>
          <Card className='cardWidth'>
            {loading && (
              <div className='loading'>
                <CircularProgress />
              </div>
            )}
            <CardHeader
              title={userData ? userData.name : ""}
              subheader={userData ? userData.cpf : ""}
            />
            <CardContent>
              <QRCode value={userData.address} />
              <List>
                <ListItem>
                  <ListItemText
                    primary='Primeira dose'
                    secondary={
                      userData && vacinas[0] !== 0 ? vacinas[0] : "Ainda nada"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary='Primeira dose'
                    secondary={
                      userData && vacinas[1] !== 0 ? vacinas[1] : "Ainda nada"
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
                  onClick={navigator.clipboard.writeText(
                    userData ? userData.address : ""
                  )}
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
