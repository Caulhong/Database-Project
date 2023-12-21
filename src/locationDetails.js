import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './locationDetails.css';
import { useNavigate } from 'react-router-dom';

const LocationDetails = () => {
  const navigate = useNavigate();
  const stateData = useLocation().state;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [enrolledDevices, setEnrolledDevices] = useState([]); 
  const [Devices, setDevices] = useState([]); 
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [filteredModels, setFilteredModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const username = stateData.username;
  
// fetch the divices for the location
  const fetchLocationDetails = () => {
    fetch('http://localhost:8080/locationDetails.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username:username,
            building_address: stateData.location.building_address, 
            unit_number: stateData.location.unit_number
          })
      })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setIsLoggedIn(true);
        setEnrolledDevices(data.data);
        fetchDevices();
      } else {
        console.log('failed:', data.error);
        alert(data.error); 
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      alert('Failed to load data');
    });
  };

// fetch divices information for adding
  const fetchDevices = () => {
    fetch('http://localhost:8080/getDevices.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username})

      })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setDevices(data.data);
      } else {
        console.log('failed:', data.error);
        alert(data.error); 
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      alert('Failed to load data');
    });
  };

  const removeLocation = () => {
    fetch('http://localhost:8080/removeLocation.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username:username,
            building_address: stateData.location.building_address, 
            unit_number: stateData.location.unit_number})
      })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        navigate('/show',{state: {
          username:username,
          buildingAddress: stateData.location.building_address, 
          unitNumber: stateData.location.unit_number 
        } });
        console.log('remove successful');
      } else {
        alert(data.message); 
        console.log('remove failed:', data.message);
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      alert('Failed to load data');
    });
  };

  const handleDeviceClick = (deviceId) => {
    setSelectedDeviceId(deviceId);

  };

  const removeDevice = (deviceId) => {
    fetch('http://localhost:8080/removeDevice.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username,selectedDeviceId})
      })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.success) {
        fetchLocationDetails();
        console.log('remove successful');
      } else {
        alert(data.error); 
      }
    })
    .catch(error => {
      alert('Failed to load data');
    });
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setFilteredModels(Devices.filter(device => device.type === selectedType));
  };

  const handleModelChange = (e) => {
    console.log("changed");
    setSelectedModel(e.target.value);
  };

  const addDevice = (selectedModel,building_address,unit_number) => {
    if(selectedModel === ''){
      alert("Must select model");
      console.log("return");
      return;
    }
    fetch('http://localhost:8080/addDevice.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          selectedModel: selectedModel,
          buildingAddress: building_address, 
          unitNumber: unit_number
        })
      })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        fetchLocationDetails();
        console.log('add successful');
      } else {
        console.log('add failed:', data.error);
        alert(data.error); 
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      alert('Failed to load data');
    });
  };

  const redirectToApp = () => {
    navigate('/App', { 
      state: {
        username:username,
        buildingAddress: stateData.location.building_address, 
        unitNumber: stateData.location.unit_number 
      } 
    });
  };


  useEffect(() => {
    fetchLocationDetails(); 
  }, []);


    useEffect(() => {
    if (selectedType) {
      const newFilteredModels = Devices.filter(device => device.type === selectedType);
      setFilteredModels(newFilteredModels);
    } else {
      setFilteredModels([]);
    }
  }, [selectedType, Devices]);

  return (
    <div className="location-details-container">
      <div className="location-data">
        <h2 className="location-header">Location Details</h2>
        {Object.entries(stateData.location).map(([key, value]) => (
          <p key={key} className="location-info">
            <strong>{key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}:</strong> {value}
          </p>
        ))}
        <button type="button" className="btn" onClick={() => removeLocation()}>Remove This Location</button>
      </div>

      <div className="device-section">
        <h3>Devices in this Location</h3>
      
        <table className="devices-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Model</th>
            </tr>
          </thead>
          <tbody>
            {enrolledDevices.map(device => (
              <React.Fragment key={device.device_id}> {/* Use React.Fragment to wrap -> can only return single element */}
                <tr onClick={() => handleDeviceClick(device.device_id)}>
                  <td>{device.type}</td>
                  <td>{device.model_number}</td>
                </tr>
                {selectedDeviceId === device.device_id && (
                  <tr>
                    <td colSpan="3"> 
                      <button 
                        type="button" 
                        className="btn" 
                        onClick={() => removeDevice(device.device_id)}
                      >
                        Remove This Device
                      </button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="selectors-container">
        <div className="location-data">
          <div className="device-type-selector">
            <h3>Select Device Type</h3>
            <select value={selectedType} onChange={handleTypeChange}>
              <option value="">Select Type</option>
              {Array.from(new Set(Devices.map(device => device.type))).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="device-model-selector">
            <h3>Select Device Model</h3>
            <select disabled={!selectedType} onChange={handleModelChange}>
              <option value="">Select Type</option>
              {filteredModels.map((device, index) => (
                <option key={index} value={device.model_number}>{device.model_number}</option>
              ))}
            </select>
          </div>
          <button type="button" className="btn" onClick={() => addDevice(selectedModel,stateData.location.building_address,stateData.location.unit_number)} >Add this Device</button>
        </div>
      </div>
      <div>
        <button onClick={redirectToApp} className="btn">
          Go to Usage Details
        </button>
      </div>
    </div>
  );
};

export default LocationDetails;
