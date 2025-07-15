// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import Login from './Login';
import Habit from './Habit';
import Registration from './Register.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/:email" element={<Habit />} />
          <Route path="/register" element={<Registration />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
