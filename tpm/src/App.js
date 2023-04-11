import React,{useState, useEffect} from "react";
import Web3 from "web3";
import TyrePressureMonitor from "./contracts/TyrePressureMonitor.json";
import './BKTApp.css';

const web3 = new Web3(Web3.givenProvider);

function App(){
  const [tyreIndex, setTyreIndex] = useState(0);
  const [newPressure, setNewPressure] = useState(0);
  const [tyrePressureReadings, setTyrePressureReadings] = useState([0,0,0,0]);
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

  const [showTable, setShowTable] = useState(false);



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

  const getTyrePressureHistory = async (tyreIndex) => {
    const history = await contract.methods
      .getTyrePressureHistory(tyreIndex)
      .call();
    setTyrePressureHistory(history);
  };

  const getAllTyrePressureHistory = async () => {
    const historyPromises = [];
    for (let i = 0; i < 4; i++) {
      historyPromises.push(contract.methods.getTyrePressureHistory(i).call());
    }
    const allHistory = await Promise.all(historyPromises);
    setTyrePressureHistory(allHistory);
    setShowTable(true);

  };

  const handleHistoryButtonClick = () => {
    getAllTyrePressureHistory();
  };


  const handleSetPressureThreshold = async () => {
    // const value = parseInt(pressureThresholdInput);
    await contract.methods.setPressureThreshold(pressureThresholdInput).send({ from: account });
    const threshold = await contract.methods.getTyrePressureThreshold().call();
    setPressureThreshold(threshold);
    console.log("Pressure Threshold:", pressureThreshold);
    setPressureThresholdInput('');
  };

  const handleSetTyrePressure = async () => {
      await contract.methods.updateTyrePressure(tyreIndex, tyrePressureInput).send({ from: account });
      updateTyrePressure(tyreIndex,tyrePressureInput);
      setTyrePressureInput(0);
      handleHistoryButtonClick();
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
    setPressureThresholdInput(parseInt(event.target.value));
    console.log("Current Threshold Input:", pressureThresholdInput);
  }



  return (
  <div class="parent">
    <div class="s1block">
      <h1>Tyre Pressure Monitoring System</h1>
      <h2>Account: {account}</h2>
      <label>
            Tyre Pressure Alert Threshold:
            <input
              type="number"
              value={pressureThresholdInput}
              onChange={handleThresholdInput}
              className="input-box"
            />
        </label>
        <button onClick={handleSetPressureThreshold}>Set Pressure Threshold</button>
    </div>
    <div class="container">
      <div class="left">
        <h2>Current Tyre Pressures</h2>
        <ul>
          <li>
            Tyre 0: <progress value={tyrePressureReadings[0]} max={pressureThreshold} />
            {tyrePressureReadings[0]}
          </li>
          <li>
            Tyre 1: <progress value={tyrePressureReadings[1]} max={pressureThreshold} />
            {tyrePressureReadings[1]}
          </li>
          <li>
            Tyre 2: <progress value={tyrePressureReadings[2]} max={pressureThreshold} />
            {tyrePressureReadings[2]}
          </li>
          <li>
            Tyre 3: <progress value={tyrePressureReadings[3]} max={pressureThreshold} />
            {tyrePressureReadings[3]}
          </li>
        </ul>
        <h2>Current Tyre Pressure Alert Threshold: {pressureThreshold}</h2>
      </div>
      <div class="right">
        <h2>Update Tyre Pressure</h2>
        <label>
          Tyre Index:
          <select value={tyreIndex} onChange={handleChangeTyreIndex}>
            <option value={0}>Tyre 0</option>
            <option value={1}>Tyre 1</option>
            <option value={2}>Tyre 2</option>
            <option value={3}>Tyre 3</option>
          </select>
          <label>
            Tyre Pressure:
            <input type="number" value={tyrePressureInput} onChange={handleChangeTyrePressureInput} />
          </label>
          <button onClick={handleSetTyrePressure}>Set Tyre Pressure</button>  
        </label>
      </div>
    </div>
    <div class="table"> 
         <button onClick={handleHistoryButtonClick}>Get Tyre History</button>
            {showTable && (
              <table>
                <thead>
                  <tr>
                    <th>Tyre Index</th>
                    <th>Tyre Pressure History</th>
                  </tr>
                </thead>
                <tbody>
                  {tyrePressureHistory.map((pressureHistory, index) => (
                    <tr key={index}>
                      <td>Tyre {index}</td>
                      <td>{pressureHistory.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
    </div>
  </div>
  );
};
export default App;