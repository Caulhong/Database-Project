import * as React from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useState } from 'react';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { BarPlot } from '@mui/x-charts/BarChart';
import { LinePlot, MarkPlot } from '@mui/x-charts/LineChart';
export default function BarAnimation({ address, unit, date, checkedItems, time}) {
  if(time === "month")
  {
    date = date.format("YYYY")
  }
  else if(time === "day")
  {
    date = date.format("YYYY-MM")
    console.log(date)
  }
  const showAvg = (event) => {
    setAvg(event.target.checked);
  };
  const showSum = (event) => {
    setSum(event.target.checked);
  };
  const [avg, setAvg] = useState(false);
  const [sum, setSum] = useState(false);
  var trueKeys = Object.keys(checkedItems).filter(key => checkedItems[key] === true);
  const [data, setData] = useState([]);
  const [timestamp, setTimestamp] = useState([]);
  useEffect(()=>{
    fetch("http://localhost:8080/sql.php", {
			method: "POST",
            credentials: 'include',
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
        address: address,
        unit: unit,
		device_id : trueKeys,
        date: date, 
        time: time
			}),
		})
			.then((response) => response.json())
			.then((res) => {
          console.log(typeof res.data);
          setTimestamp(res.data['0'].map(x => x.date_sequence))
          console.log(timestamp);
          var Data = []
          if(sum)
          {
            let tmp = []
            for(let i = 0; i < res.data['0'].length; ++i)
            {
              let temp = 0;
              for(let j = 0; j < trueKeys.length; ++j)
              {
                  temp += res.data[trueKeys[j]][i].sum_value;
              }
              tmp.push(temp)
            }
            let sum_array = {}
            sum_array['label'] = 'sum'
            sum_array['data'] = tmp
            Data.push(sum_array);
          }
          else{
          for(let i = 0; i < trueKeys.length; ++i)
          {
              let tmp = {}
              tmp['label'] = trueKeys[i]
              tmp['data'] = res.data[trueKeys[i]].map(x => x.sum_value);
              Data.push(tmp);
          }
        }
          if(avg)
          {
            let a = {}
            a['label'] = "avg"
            a['data'] = res.data['avg'].map(x => x.sum_value);
            Data.push(a);
          }
          console.log(Data);
          setData(Data);
			})
			.catch((err) => console.log(err));
  }, [checkedItems, date, avg, sum])
  return (
    <Box sx={{ width: '80%' }}>
    <BarChart
      height={500}
      xAxis={[{ scaleType: 'band', data:  timestamp}]}
      series={data}
    />
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
    <FormControlLabel 
        checked={avg}
        control={
          <Checkbox onChange={showAvg} color="success" />
        }
        label="avg"
        labelPlacement="start"
    />
    <FormControlLabel
        checked={sum}
        control={
          <Checkbox onChange={showSum}  color="default"/>
        }
        label="sum"
        labelPlacement="start"
    />
    </Box>
    </Box>
  );
}