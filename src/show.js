import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './show.css'; 
import { useLocation } from 'react-router-dom';

const Show = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [serviceLocations, setServiceLocations] = useState([]); 
  const navigate = useNavigate();
  // for add service locations
  const [buildingAddress, setBuildingAddress] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [date, setDate] = useState('');
  const [squareFeet, setSquareFeet] = useState('');
  const [numBedrooms, setNumBedrooms] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [addError, setAddError] = useState('');
  const stateData = useLocation().state; 
  const username = stateData.username;

  const fetchServiceLocations = () => {
    console.log(username);
    fetch('http://localhost:8080/show.php', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({username}),
    })
    .then(response => response.json())
    .then(result => {
      if (result.error) {
        setQueryError(result.error);
      } else if (result.isLoggedIn) {
        setIsLoggedIn(true);
        setServiceLocations(result.data);
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      setQueryError('Failed to load data');
    });
  };

  useEffect(() => {
    fetchServiceLocations(); 
  }, []);

  const showRegisteredDevices = (location) => {
    navigate('/locationDetails', { state: { username,location } });
  };


  const addServiceLocation = (event) => {
    event.preventDefault();
    fetch('http://localhost:8080/addLocation.php', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username,buildingAddress, unitNumber,date,squareFeet,numBedrooms,zipCode}),
    })
    .then(response => response.json()) 
    .then(data => {
      if (data.success) {
        fetchServiceLocations();
        console.log('Add successful');
      } else {
        console.log('Add failed:', data.error);
        setAddError(data.error); 
      }
    })
    .catch(error => {
      console.error('Error during fetch operation:', error);
      setAddError('Error during fetch operation');
    });
    fetchServiceLocations(); 
  };

  if (!isLoggedIn) {
    return <div>Please log in.</div>;
  }

  return (
    <div className="dashboard-container">
      Welcome to the Dashboard, {username}!
  
      <div>
        Service Locations:
        {queryError && <p className="error-message">{queryError}</p>}
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {serviceLocations.map((location, index) => (
              <tr key={index} onClick={() => showRegisteredDevices(location)}>
                <td>{location.building_address}</td>
                <td>{location.unit_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <form onSubmit={addServiceLocation}>
          <input
            type="text"
            value={buildingAddress}
            onChange={(e) => setBuildingAddress(e.target.value)}
            placeholder="Building Address"
          />
          <input
            type="number"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder="Unit Number"
          />
          <input
            type="number"
            value={squareFeet}
            onChange={(e) => setSquareFeet(e.target.value)}
            placeholder="Square Feet"
          />
          <input
            type="number"
            value={numBedrooms}
            onChange={(e) => setNumBedrooms(e.target.value)}
            placeholder="Number of Bedrooms"
          />
          <input
            type="number"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Zip Code"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {addError && <p className="error-message">{addError}</p>}
                   
          
          <button type="submit" className="add-location-btn">Add Location</button>
        </form>
      </div>
  
      {queryError !== '' && (
        <div className="error-message">Error: {queryError}</div>
      )}
    </div>
  );
};

export default Show;
