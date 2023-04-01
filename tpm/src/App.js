import React,{useState, useEffect} from "react";
import Web3 from "web3";
import TyrePressureMonitor from "./contracts/TyrePressureMonitor.json";

function App(){
  const [tyreIndex, setTyreIndex] = useState(0);
  const [newPressure, setNewPressure] = useState(0);
  const [alertThreshold, setAlertThreshold] = useState(0);
  const [tyrePressureReadings, setTyrePressureReadings] = useState(null);
  const [tyrePressure, setTyrePressure] = useState(0);
  const [tyrePressureHistory, setTyrePressureHistory] = useState([]);
  const [tyrePressureInput, setTyrePressureInput] = useState('');

  const[contract, setContract] = useState(null);
  const[accounts, setAccount] = useState("");

  useEffect(() => {
    const init = async() => {
      try{
        const ganacheProvider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
        const web3Instance = new Web3(ganacheProvider);

        const chainID = await web3Instance.eth.getChainId();
        console.log("Chain ID:", chainID);

        const accounts = await web3Instance.eth.getAccounts();
        console.log("Accounts:", accounts);
        setAccount(accounts[0]);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = TyrePressureMonitor.networks[networkId];
        const tyrePressureMonitorContract = new web3Instance.eth.Contract(
          TyrePressureMonitor.abi,
          deployedNetwork && deployedNetwork.address,
        );
        setContract(tyrePressureMonitorContract);

        const tyrePressureReadings = await contract.methods
          .tyrePressureReadings(0)
          .call();
        setTyrePressureReadings(tyrePressureReadings);
      } 
    catch(error){
      console.log(error);
    }
    };
    init();
  }, []);

  const updateTyrePressure = async () => {
    try {
      await contract.updateTyrePressure(tyreIndex, newPressure);
      console.log("Tyre pressure updated!");
    } catch (error) {
      console.error(error);
    }
  };

  const getTyrePressure = async () => {
    try {
      const pressure = await contract.getTyrePressure(tyreIndex);
      setTyrePressure(pressure.toNumber());
      console.log(`Tyre ${tyreIndex} pressure: ${pressure}`);
    } catch (error) {
      console.error(error);
    }
  };

  


  const handleSetTyrePressure = async () => {
    await contract.methods.updateTyrePressure(tyreIndex, tyrePressureInput).send({ from: accounts[0] });
    setTyrePressureInput(0);
  };

  const handleChangeTyreIndex = (event) => {
    setTyreIndex(parseInt(event.target.value));
  };

  const handleChangeTyrePressureInput = (event) => {
    setTyrePressureInput(parseInt(event.target.value));
  };

  return (
    <div>
      <h1>Tyre Pressure Monitoring System</h1>
      <h2>Current Tyre Pressures</h2>
      <ul>
        <li>Tyre 0: {tyrePressureReadings[0]}</li>
        <li>Tyre 1: {tyrePressureReadings[1]}</li>
        <li>Tyre 2: {tyrePressureReadings[2]}</li>
        <li>Tyre 3: {tyrePressureReadings[3]}</li>
      </ul>
      <h2>Update Tyre Pressure</h2>
      <div>
        <label>
          Tyre Index:
          <select value={tyreIndex} onChange={handleChangeTyreIndex}>
            <option value={0}>Tyre 0</option>
            <option value={1}>Tyre 1</option>
            <option value={2}>Tyre 2</option>
            <option value={3}>Tyre 3</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Tyre Pressure:
          <input type="number" value={tyrePressureInput} onChange={handleChangeTyrePressureInput} />
        </label>
      </div>
      <button onClick={handleSetTyrePressure}>Set Tyre Pressure</button>
    </div>
  );
}
export default App;