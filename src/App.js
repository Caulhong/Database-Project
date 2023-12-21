import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import BarAnimation from './bar';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
function App() {
  const locationData = useLocation().state; 
  const address = locationData.buildingAddress;
  const unit = locationData.unitNumber;
  const [loginError, setLoginError] = useState('');
  const [data, setData] = useState([]);
  const [date, setDate] = useState(dayjs('2022-8-21'));
  const [checked, setChecked] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [time, setTime] = useState("month");
  const username = locationData.username;

  const handleChange3 = (event) => {
    setTime(event.target.value);
  };

  const handleChange2 = (event) => {
    const { value, checked } = event.target;
    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [value]: checked,
    }));
  };

  const handleChange = (event) => {
    console.log(data);
    let tmp = {}
    for(let i = 0; i < data.length; ++i)
    {
      tmp[data[i].device_id] = event.target.checked;
    }
    console.log(tmp);
    setCheckedItems(tmp);
    setChecked(event.target.checked);
  };

  useEffect(() => {
    fetch("http://localhost:8080/getDevicesForView.php", {
      method: "POST",
      credentials: 'include',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        address: address,
        unit: unit
      }),
    })
    .then((response) => response.json())
    .then((res) => {
      if (res.isLoggedIn) {
        setData(res.data);
        let tmp = {}
      for(let i = 0; i < res.data.length; ++i)
      {
        tmp[res.data[i].device_id] = false;
      }
      console.log(tmp);
    setCheckedItems(tmp);
      } else {
        setLoginError("not logged in"); 
      }
    })
    .catch((err) => console.log(err));
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {loginError && <p className="error-message">{loginError}</p>}
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {/* Devices Selector */}
        <FormControl>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={time}
            onChange={handleChange3}
          >
            <FormControlLabel value="year" control={<Radio />} label="Year" />
            <FormControlLabel value="month" control={<Radio />} label="Month" />
            <FormControlLabel value="day" control={<Radio />} label="Day" />
            {/* <FormControlLabel value="hour" control={<Radio />} label="Hour" /> */}
          </RadioGroup>
        </FormControl>
        
        {/* Conditional rendering based on the selected time */}
        {
        time === "hour" ? (
          // Render DatePicker when time is "year"
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                label="Date Picker"
                value={date}
                onChange={(newValue) => setDate(newValue)}
              />
            </DemoContainer>
          </LocalizationProvider>
        ) : 
        time == "day" ?(
          // Render MonthPicker for other time options (month, day, hour)
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                views={['year', 'month']} 
                label="Date Picker"
                value={date}
                onChange={(newValue) => setDate(newValue)}
              />
            </DemoContainer>
          </LocalizationProvider>
        ) : time == "month" ? (
          // Render MonthPicker for other time options (month, day, hour)
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                views={['year']} 
                label="date Picker"
                value={date}
                onChange={(newValue) => setDate(newValue)}
              />
            </DemoContainer>
          </LocalizationProvider>
        ): (
          // Render MonthPicker for other time options (month, day, hour)
          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoContainer components={['DatePicker']}>
            <DatePicker
              disabled = {true}
              views={['year']} 
              label="date Picker"
              value={date}
              onChange={(newValue) => setDate(newValue)}
            />
          </DemoContainer>
        </LocalizationProvider>
        )}

        {/* Rest of your components */}
        <BarAnimation address = {address} unit = {unit} date={date} checkedItems={checkedItems} time={time}/>
        <Box>
          <FormControlLabel
            control={
              <Checkbox checked={checked} onChange={handleChange}/>
            }
            label="all"
          />
          {data.map((item, index) => (
            <FormControlLabel
              control={<Checkbox checked={checkedItems[item.device_id]} disabled={checked}/>}
              label={`${item.device_id} - ${item.model_number}`}
              key={index}
              value={item.device_id}
              onChange={handleChange2}
            >
            </FormControlLabel>
          ))}
        </Box>
      </Box>
    </div>
  );
}

export default App;