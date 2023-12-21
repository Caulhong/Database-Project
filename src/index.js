import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Show from './show';
import LoginPage from './loginPage';
import Register from './register';
import LocationDetails from './locationDetails';
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/show" element={<Show />} />
        <Route path="/register" element={<Register />} />
        <Route path="/locationDetails" element={<LocationDetails />} />
        <Route path="/App" element={<App />} />
      </Routes>
    </BrowserRouter>
);
