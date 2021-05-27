import { useState } from 'react';
import Web3 from "web3";
import "./style.css";
import IPFS from "ipfs-api";
import * as abi from "../../utils/abi.json";
import { Button, Grid, Table } from '@material-ui/core';

const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const web3 = new Web3(
    new Web3.providers.HttpProvider("http://localhost:8545")
  );

export default function FormUpload(props) {

    const [thisIpfsHash, setThisIpfsHash] = useState(null);
    const [buffer, setBuffer] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [transactionHash, setTransactionHash] = useState('');
    const [gasUsed, setGasUsed] = useState('');
    const [thisTxReceipt, setThisTxReceipt] = useState('');

    const captureFile = (event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => convertToBuffer(reader)
    };

    const convertToBuffer = async (reader) => {
        const buffer = await Buffer.from(reader.result);
        setBuffer(buffer);
    };

    const onClick = async () => {
        try{
            setBlockNumber("waiting..");
            setGasUsed("waiting...");

            await web3.eth.getTransactionReceipt(transactionHash, (err, txReceipt)=>{
                console.log(err,txReceipt);
                setThisTxReceipt(txReceipt);
            });

            setBlockNumber(thisTxReceipt.blockNumber);
            setGasUsed(thisTxReceipt.gasUsed);
        }
        catch(error){
            console.log(error);
        }
    }

    const onSubmit = async (event) => {
        event.preventDefault();

        console.log('Sending from account: ' + props.address);

        await ipfs.add(buffer, (err, ipfsHash) => {
          console.log(err,ipfsHash);
          setThisIpfsHash(ipfsHash[0].hash);

          const contrato = new web3.eth.Contract(abi, props.address);

          contrato.methods
            .addDocumento(props.address, thisIpfsHash)
            .call({ from: props.address })
            .catch(e => console.log(e))
            .then(result => {
                console.log("document hash saved")
                setTransactionHash(result)
            });

        });
      };

      return (
        <div className="Upload">
            <header className="Upload-header">
                <h1> Ethereum and IPFS with Create React App</h1>
            </header>

            <hr />
            <Grid>
            <h3> Choose file to send to IPFS </h3>
            <form onSubmit={onSubmit}>
                <input
                    type = "file"
                    onChange = {captureFile}
                />
                <Button
                    bsStyle="primary"
                    type="submit">
                    Send it
                </Button>
          </form>
            <hr/>
            <Button onClick = {onClick}> Get Transaction Receipt </Button>
            <Table bordered responsive>
                <thead>
                    <tr>
                        <th>Tx Receipt Category</th>
                        <th>Values</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>IPFS Hash # stored on Eth Contract</td>
                        <td>{thisIpfsHash}</td>
                    </tr>
                    <tr>
                        <td>Tx Hash # </td>
                        <td>{transactionHash}</td>
                    </tr>
                    <tr>
                        <td>Block Number # </td>
                        <td>{blockNumber}</td>
                    </tr>
                    <tr>
                        <td>Gas Used</td>
                        <td>{gasUsed}</td>
                    </tr>
                </tbody>
            </Table>
        </Grid>
     </div>
    );
}
