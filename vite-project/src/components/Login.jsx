import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function LoginTela () {
  const [trocarBox, setTrocar] = useState(false);
  const [nomeCadastro, setnomeCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [nomeLogin, setNomeLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [saltoLoginUsuario, setSaltoLoginUsuario] = useState(false);
  const [saltoLoginSenha, setSaltoLoginSenha] = useState(false);
  const [saltoCadastroUsuario, setSaltoCadastroUsuario] = useState(false);
  const [saltoCadastroSenha, setSaltoCadastroSenha] = useState(false);
  const [fadeout, setFadeout] = useState(true);
  const [animacao, setAnimacao] = useState(false);
  const [animacaoBox, setAnimacaoBox] = useState(false);
  const navigate = useNavigate();

function handleLogin(e) {
    e.preventDefault();
    if (nomeLogin === ''|| senhaLogin === '')
        return alert('Campos vazios!');
    else
        fetch('/login', { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeLogin, senha: senhaLogin })
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                localStorage.setItem('usuario', nomeLogin);
                alert(`Login realizado com sucesso!\nUsuário: ${nomeLogin}\nSenha: ${senhaLogin}`);
                setFadeout(false); // ativa a animação de fade
                setTimeout(() => {
                    setNomeLogin('');
                    setSenhaLogin('');
                    navigate(`/home/${nomeLogin}`); // troca de rota após animação
                }, 500); // ajuste o tempo conforme a duração da animação CSS
                console.log('Login realizado com sucesso:', data);
            }
            else {
                alert('Usuário ou senha incorretos!');
            }
        }
        )
    .catch(error => {
        console.error('Erro ao realizar login:', error);
        alert('Erro ao realizar login. Tente novamente mais tarde.');
    }
    );
}

function handleCadastro(e) {
    e.preventDefault();
    if (nomeCadastro === '' || senhaCadastro === '')
        return alert("Preencha todos os campos!");
    else
        fetch('/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nomeCadastro, senha: senhaCadastro })
        })
        .then(response => response.json())
        .then(data => {
            alert(`Cadastro realizado com sucesso!\nUsuário: ${nomeCadastro}\nSenha: ${senhaCadastro}`);
            setnomeCadastro('');
            setSenhaCadastro('');
            setTrocar(false);
        })
        .catch(error => {
            alert('Erro ao cadastrar usuário.');
            console.error('Erro ao cadastrar:', error);
        });
}

  return (
    <div className="sidebar">
        {!trocarBox ? (
        <div>
            <div className="top">
                <div className="txt1">
                    <h1>Seja bem-vindo(a) á</h1>
                </div>
                <div className="txt2"> 
                    <h1>sua Galeria</h1>
                </div>
                <div className="logintxt">
                    <h1>Log In</h1>
                </div>
            </div>
            <div className="bottom">
                <form onSubmit={handleLogin}>
                    <input className="input" type="text" placeholder="Usuário" onChange={ e => setNomeLogin(e.target.value)} value={nomeLogin} />
                    <input className="input" type="password" placeholder="Senha" onChange={ e => setSenhaLogin(e.target.value)} value={senhaLogin} />
                    <div className="remember">
                        <input className="checkbox" type="checkbox" /> Lembre de mim
                    </div>
                    <button className="btn-login" type="submit" onClick={handleLogin}><span>Login</span></button>
                </form>
                <button className="btn-cadastro" onClick={() => setTrocar(true)}>
                    Não possuo uma conta 
                </button>
            </div>
        </div>
        ) : (
        <div>
            <div className="top">
                <div className="txt1">
                    <h1>Seja bem-vindo(a) á</h1>
                </div>
                <div className="txt2"> 
                    <h1>sua Galeria</h1>
                </div>
                <div className="logintxt">
                    <h1>Cadastro</h1>
                </div>
            </div>
            <div className="bottom">
                <form onSubmit={handleCadastro}>
                    <input className="input" type="text" placeholder="Usuário" onChange={ e => setnomeCadastro(e.target.value)} value={nomeCadastro} />
                    <input className="input" type="password" placeholder="Senha" onChange={ e => setSenhaCadastro(e.target.value)} value={senhaCadastro} />
                    <button className="btn-login" type="submit">Cadastrar</button>
                </form>
                <button className="btn-cadastro" onClick={() => setTrocar(false)}>
                    Já possuo uma conta
                </button>
            </div>
        </div>
        )}
    </div>
    
  );
  
}