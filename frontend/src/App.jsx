import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import LoginTela from './components/Login';
import RedefinirSenha from './pages/RedefinirSenha'; // ou o caminho correto


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginTela />} />
      <Route path="/home/:usuario" element={<HomePage />} />
       <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
    </Routes>
  );
}
