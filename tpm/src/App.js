import React,{useState, useEffect} from "react";
import Web3 from "web3";
import TyrePressureMonitor from "./contracts/TyrePressureMonitor.json";
import './BKTApp.css';

const web3 = new Web3(Web3.givenProvider);

function App(){
  const [tyreIndex, setTyreIndex] = useState(0);
  const [newPressure, setNewPressure] = useState(0);
  const [tyrePressureReadings, setTyrePressureReadings] = useState([Math.round(Math.random() * 25),Math.round(Math.random() * 25),Math.round(Math.random() * 25),Math.round(Math.random() * 25)]);
  const [tyrePressure, setTyrePressure] = useState(0);
  const [tyrePressureHistory, setTyrePressureHistory] = useState([]);
  
  const [tyrePressureInput, setTyrePressureInput] = useState('0');
  const [pressureThresholdInput, setPressureThresholdInput] = useState(null);
  const [pressureThreshold, setPressureThreshold] = useState(0);

  const[contract, setContract] = useState(null);
  const[account, setAccount] = useState("");

  const [web3, setWeb3] = useState(null);
  const [tyrePressureUpdatedEvent, setTyrePressureUpdatedEvent] = useState(null);
  const [tyrePressureAlertEvent, setTyrePressureAlertEvent] = useState(null);
  const [tyrePressureUpdatedLogs, setTyrePressureUpdatedLogs] = useState([]);
  const [tyrePressureAlertLogs, setTyrePressureAlertLogs] = useState([]);


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
          .tyrePressureReadings()
          .call();
        setTyrePressureReadings(tyrePressureReadings);

        
        // Get past logs for TyrePressureUpdated event
        const tyrePressureUpdatedEventInstance = contract.events.TyrePressureUpdated({});
        const tyrePressureUpdatedLogsResult = await tyrePressureUpdatedEventInstance.getPastEvents("allEvents", { fromBlock: 0, toBlock: "latest" });
        setTyrePressureUpdatedLogs(tyrePressureUpdatedLogsResult);

        // Subscribe to TyrePressureUpdated event
        const tyrePressureUpdatedEventSubscription = tyrePressureUpdatedEventInstance.on("data", (event) => {
          setTyrePressureUpdatedLogs((prevState) => [...prevState, event]);
        });
        setTyrePressureUpdatedEvent(tyrePressureUpdatedEventSubscription);

        // Get past logs for TyrePressureAlert event
        const tyrePressureAlertEventInstance = contract.events.TyrePressureAlert({});
        const tyrePressureAlertLogsResult = await tyrePressureAlertEventInstance.getPastEvents("allEvents", { fromBlock: 0, toBlock: "latest" });
        setTyrePressureAlertLogs(tyrePressureAlertLogsResult);

        // Subscribe to TyrePressureAlert event
        const tyrePressureAlertEventSubscription = tyrePressureAlertEventInstance.on("data", (event) => {
          setTyrePressureAlertLogs((prevState) => [...prevState, event]);
        });
        setTyrePressureAlertEvent(tyrePressureAlertEventSubscription);
      } 
    catch(error){
      console.log(error);
    }
    };

    init();

    return () => {
      if (tyrePressureUpdatedEvent) {
        tyrePressureUpdatedEvent.unsubscribe();
      }
      if (tyrePressureAlertEvent) {
        tyrePressureAlertEvent.unsubscribe();
      }
    };

  }, []);

  function updateTyrePressure(tyreIndex, newPressure) {
    setTyrePressureReadings(prevReadings => {
      const newReadings = [...prevReadings];
      newReadings[tyreIndex] = newPressure;
      return newReadings;
    });
  }


  const getTyrePressure = async () => {
    try {
      const pressure = await contract.getTyrePressure(tyreIndex);
      setTyrePressure(pressure.toNumber());
      console.log(`Tyre ${tyreIndex} pressure: ${pressure}`);
    } catch (error) {
      console.error(error);
    }
  };

  
  const handleSetPressureThreshold = async () => {
    // const value = parseInt(pressureThresholdInput);
    await contract.methods.setPressureThreshold(pressureThreshold).send({ from: account });
    const threshold = await contract.methods.getTyrePressureThreshold().call();
    setPressureThreshold(threshold);
    console.log("Pressure Threshold:", pressureThreshold);
    setPressureThresholdInput(null);
  };

  const handleSetTyrePressure = async () => {
      window.alert("Punda Less than");
      await contract.methods.updateTyrePressure(tyreIndex, tyrePressureInput).send({ from: account });
      updateTyrePressure(tyreIndex,tyrePressureInput);
      setTyrePressureInput(0);
  };

  const handleChangeTyreIndex = (event) => {
    setTyreIndex(parseInt(event.target.value));
    console.log("Tyre Index Changed");
  };

  const handleChangeTyrePressureInput = (event) => {
    setTyrePressureInput(parseInt(event.target.value));
    console.log("Tyre Pressure Input Changed");
  };

  const handleThresholdInput = (event) => {
    setPressureThreshold(parseInt(event.target.value));
    console.log("Current Threshold Input:", pressureThreshold);
  }

  const getTyrePressureHistory = async (tyreIndex) => {
    const history = await contract.methods.getTyrePressureHistory(tyreIndex).call();
    setTyrePressureHistory(history);
  };


  return (
    <div>
      <h1>Tyre Pressure Monitoring System</h1>
      <h2>Account: {account}</h2>
      <h2>Current Tyre Index: {tyreIndex}</h2>
      <h2>Current Tyre Input: {tyrePressureInput}</h2>
       <h2>Current Tyre Pressure Alert Threshold: {pressureThreshold}</h2>
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
      <div>
        <label>
          Tyre Pressure Alert Threshold:
          <input
            type="number"
            value={pressureThresholdInput}
            onChange={handleThresholdInput}
          />
        </label>
      </div>
      <button onClick={handleSetPressureThreshold}>Set Pressure Threshold</button>

    
      <h1>Tyre Pressure Events</h1>
      <h2>TyrePressureUpdated Events:</h2>
      <ul>
        {tyrePressureUpdatedLogs.map((log, index) => (
          <li key={index}>
            Tyre {log.returnValues.tyreIndex} Pressure Updated: {log.returnValues.newPressure}
          </li>
        ))}
      </ul>
      <h2>TyrePressureAlert Events:</h2>
      <ul>
        {tyrePressureAlertLogs.map((log, index) => (
          <li key={index}>
            Tyre {log.returnValues.tyreIndex} Pressure Alert: {log.returnValues.currentPressure}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;


// <label>
//           Tyre Pressure Alert Threshold:
//           <input type="number" value={pressureThresholdInput} onChange={handleChangeAlertThresholdInput} />
//         </label>
//         <button onClick={updateAlertThreshold}>Set Tyre Pressure Alert Threshold</button>

// const handleChangeAlertThresholdInput = (event) => {
//   setAlertThreshold(parseInt(event.target.value));
//   console.log("Threshold Value Changed:" , alertThreshold);
// };



// const updateAlertThreshold = async () => {
//   await TyrePressureMonitor.methods.setPressureThresholdInput(alertThreshold).send({ from: account });
//   setPressureThresholdInput(alertThreshold);
// };


{/* <div>
<label>
  Pressure History:
  <input
    type="number"
    value={pressureThresholdInput}
    onChange={handleThresholdInput}
  />
</label>
</div>
<button onClick={getTyrePressureHistory(0)}>Get History</button>
<ul>
{tyrePressureHistory.map((pressure, index) => (
<li key={index}>Pressure {index}: {pressure}</li>
))}
</ul> */}