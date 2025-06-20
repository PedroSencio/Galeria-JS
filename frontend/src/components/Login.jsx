import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function LoginTela () {
  const [trocarBox, setTrocar] = useState(false);
  const [nomeCadastro, setnomeCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [nomeLogin, setNomeLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [fadeout, setFadeout] = useState(true);
  const [emailCadastro, setEmailCadastro] = useState('');
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
      function boxEmail() {
          const emailElement = document.getElementById('email');
          const backElement = document.getElementById('back');

          if (emailElement && backElement) {
              emailElement.style.display = 'block';
              backElement.style.display = 'block';
              backElement.style.position = 'fixed';

              document.body.classList.add('modal-active'); // Adiciona classe ao body
          } else {
              console.error('Elementos com IDs "email" ou "back" não encontrados no DOM.');
          }
      }

      function closeModal() {
          const emailElement = document.getElementById('email');
          const backElement = document.getElementById('back');

          if (emailElement && backElement) {
              emailElement.style.display = 'none';
              backElement.style.display = 'none';

              document.body.classList.remove('modal-active'); // Remove classe do body
          }
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
          closeModal();
        } else {
          alert('Erro ao enviar email: ' + data.mensagem);
        }
      })
      .catch(err => {
        console.error('Erro ao enviar email:', err);
        alert('Erro ao enviar email.');
      });
  }

  useEffect(() => {
    const mp = new MercadoPago('SUA_PUBLIC_KEY_PRODUCAO', {
      locale: 'pt-BR'
    });

    const cardForm = mp.fields.create('cardForm', {
      amount: 100, // valor do ingresso
      iframe: true,
      fields: {
        cardholderName: { placeholder: 'Nome do titular' },
        cardNumber: { placeholder: 'Número do cartão' },
        expirationDate: { placeholder: 'MM/AA' },
        securityCode: { placeholder: 'CVV' }
      },
      callbacks: {
        onSubmit: async (event) => {
          event.preventDefault();
          try {
            const { token } = await cardForm.submit();
            console.log('Token do cartão:', token);
            // Envie o token para o seu servidor para processar o pagamento
          } catch (error) {
            console.error('Erro ao gerar token:', error);
          }
        }
      }
    });

    // Renderiza os campos no formulário
    cardForm.render('#payment-form');
  }, []);

  return (
    <div className="sidebar">
        <div id="back"  style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1 }}>
        <div id="email" className="email-box" >
            <h2 style={{ fontWeight: 'bold !important' }}>Recuperar Senha</h2>
            <p>Digite seu email para receber instruções de recuperação:</p>
            <form onSubmit={email} method="POST">
                <input
                    id="emailInput"
                    value={emailCadastro}
                    type="email"
                    placeholder="Email"
                    onChange={e => setEmailCadastro(e.target.value)}
                    />
<button type="submit" onClick={() => alert('Instruções enviadas!')}>Enviar</button>
                <button type="button" onClick={() => closeModal()}>Fechar</button>
            </form>

        </div>
        </div>
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
                <div style={{ display: 'flex', justifyContent:'center', marginTop: '10px', width: '100%'}}>
                <button className="btn-cadastro" onClick={() => setTrocar(true)}>
                    Não possuo uma conta 
                </button>
                <button className="btn-cadastro" onClick={() => boxEmail()}>
                    Esqueci minha senha
                </button>
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
                    <input className="input" type="text" placeholder="Usuário" onChange={ e => setnomeCadastro(e.target.value)} value={nomeCadastro} />
                    <input className="input" type="text" placeholder="Email" onChange={ e => setEmailCadastro(e.target.value)} value={emailCadastro} />
                    <input className="input" type="password" placeholder="Senha" onChange={ e => setSenhaCadastro(e.target.value)} value={senhaCadastro} />
                    <button className="btn-login" type="submit">Cadastrar</button>
                </form>
                <button className="btn-cadastro" onClick={() => setTrocar(false)}>
                    Já possuo uma conta
                </button>
            </div>
        </div>
        )}
        <div id="payment-form"></div>
    </div>
    
  );
  
}