import "./App.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Form from "./components/Form";
import Web3 from "web3";
import { name, br } from "faker-br";
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

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const contrato = new web3.eth.Contract(abi, contractAddress);

function App() {
  const [userData, setUserData] = useState(null);
  const [dose1, setDose1] = useState(null);
  const [dose2, setDose2] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addUser, setAddUser] = useState(false);

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
      if(addUser){
        const currentUser = await Auth.currentAuthenticatedUser({
          bypassCache: true,
        });

      }
    };


  },[]);

  const logout = async () => {
    try {
      setUserData(null);
      setDose1(null);
      setDose2(null);
      setUserId(null);
      await Auth.signOut();
      window.location.reload();
    } catch (error) {
      console.log("error signing out: ", error);
    }
  };

  return (
    <div className='App'>
      <div className={modalAberto ? "overlay" : "esconder"}>
        <div className='stats'>
          <button onClick={() => setModalAberto(false)} className='fecharModal'>
            &times;
          </button>
          <Form userId={userId} setModalAberto={setModalAberto} />
        </div>
      </div>
      <Header
        setModalAberto={setModalAberto}
        registered={!!userData}
        logout={logout}
      />
      {loading && <CircularProgress />}
      {!loading && !!userData && (
        <main>
          <Card>
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
                    secondary={userData && dose1 ? dose1 : "Ainda nada"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary='Primeira dose'
                    secondary={userData && dose2 ? dose2 : "Ainda nada"}
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
