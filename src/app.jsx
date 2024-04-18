import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Home } from './home/home';
// import { Login } from './login/login';
// import { SignUp } from './signup/signup';

export default function App() {
    return (
        <BrowserRouter>
        
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='*' element={<Home />} />
            </Routes>
    
        </BrowserRouter>
      );
}