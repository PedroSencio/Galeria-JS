import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function LoginTela () {
  const [trocarBox, setTrocar] = useState(false);
  const [expandirBox, setExpandir] = useState(false);
  const [nomeCadastro, setnomeCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [nomeLogin, setNomeLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [fadeout, setFadeout] = useState(true);
  const [emailCadastro, setEmailCadastro] = useState('');
  const navigate = useNavigate();
  const [codigoGerado, setCodigoGerado] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [aguardandoCodigo, setAguardandoCodigo] = useState(false);


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
              body: JSON.stringify({ nome: nomeCadastro, senha: senhaCadastro, email: emailCadastro })
          })
          .then(response => response.json())
          .then(data => {
              alert(`Cadastro realizado com sucesso!\nUsuário: ${nomeCadastro}\nSenha: ${senhaCadastro}\nEmail: ${emailCadastro}`);
              setnomeCadastro('');
              setSenhaCadastro('');
              setEmailCadastro('');
              setTrocar(false);
          })
          .catch(error => {
              alert('Erro ao cadastrar usuário.');
              console.error('Erro ao cadastrar:', error);
          });
  }

    function email(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;

  if (email === '') {
    alert('Por favor, preencha o campo de email.');
    return;
  }

  fetch('https://galeria-js.onrender.com/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email })
  })
    .then(res => res.json())
    .then(data => {
      if (data.sucesso) {
        alert('Instruções enviadas para o email!');
        setCodigoGerado(data.token); // Armazena o token gerado pelo backend
        setAguardandoCodigo(true);
      } else {
        alert('Erro ao enviar email: ' + data.mensagem);
      }
    })
    .catch(err => {
      console.error('Erro ao enviar email:', err);
      alert('Erro ao enviar email.');
    });
}

  async function handleChave(e) {
    e.preventDefault();

    if (codigoDigitado === '') {
      alert('Por favor, preencha o campo de código.');
      return;
    }

    try {
      const resposta = await fetch('https://galeria-js.onrender.com/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          codigoDigitado: codigoDigitado
        })
      });

      if (!resposta.ok) {
        throw new Error('Falha na requisição: ' + resposta.status);
      }

      const dados = await resposta.json();

      if (dados.valido) {
        alert('Código verificado com sucesso! Você pode redefinir sua senha.');
        navigate('/redefinir-senha');
        setExpandir(false);
        setAguardandoCodigo(false);
      } else {
        alert('Código inválido. Tente novamente.');
      }
    } catch (erro) {
      console.error(erro);
      alert('Ocorreu um erro. Tente novamente mais tarde.');
    }
  }



  return (
  <div className="sidebar">
    {expandirBox ? (
      <div
        id="back"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }}
      >
        <div id="email" className="email-box">
          <h2 style={{ fontWeight: 'bold', fontSize: '30px', fontFamily: 'Arial' }}>
            Recuperar Senha
          </h2>
          <p style={{ fontFamily: 'Arial' }}>
            Digite seu email para receber instruções de recuperação:
          </p>
          <form onSubmit={email} method="POST">
            {!aguardandoCodigo ? (
  <>
    <input
      id="emailInput"
      value={emailCadastro}
      type="email"
      className="codigoInput"
      placeholder="Email"
      onChange={(e) => setEmailCadastro(e.target.value)}
    />
    <button className="botao_email" type="submit">Enviar</button>
    <button className="botao_email0" type="button" onClick={() => {setExpandir(false)}}>Fechar</button>
  </>
) : (
  <>
    <input
      id="codigoInput"
      value={codigoDigitado}
      type="text"
      className="codigoInput"
      placeholder="Código de verificação"
      onChange={(e) => setCodigoDigitado(e.target.value)}
    />
    <button className="botao_email" type="button" onClick={handleChave}>Verificar</button>
    <button className="botao_email0" type="button" onClick={() => {setExpandir(false); setAguardandoCodigo(false);}}>Fechar</button>
  </>
)}
          </form>
        </div>
      </div>
    ) : null}

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
            <input className="input" type="text" placeholder="Usuário" onChange={e => setNomeLogin(e.target.value)} value={nomeLogin} />
            <input className="input" type="password" placeholder="Senha" onChange={e => setSenhaLogin(e.target.value)} value={senhaLogin} />
            <div className="remember">
              <input className="checkbox" type="checkbox" /> Lembre de mim
            </div>
            <button className="btn-login" type="submit"><span>Login</span></button>
          </form>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', width: '100%' }}>
            <button className="btn-cadastro" onClick={() => setTrocar(true)}>Não possuo uma conta</button>
            <button className="btn-cadastro" onClick={() => setExpandir(true)}>Esqueci minha senha</button>
          </div>
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
            <input className="input" type="text" placeholder="Usuário" onChange={e => setnomeCadastro(e.target.value)} value={nomeCadastro} />
            <input className="input" type="text" placeholder="Email" onChange={e => setEmailCadastro(e.target.value)} value={emailCadastro} />
            <input className="input" type="password" placeholder="Senha" onChange={e => setSenhaCadastro(e.target.value)} value={senhaCadastro} />
            <button className="btn-login" type="submit">Cadastrar</button>
          </form>
          <button className="btn-cadastro" onClick={() => setTrocar(false)}>Já possuo uma conta</button>
        </div>
</div>
)}
    </div>
    )}
