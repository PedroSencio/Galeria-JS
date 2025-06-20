import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function RedefinirSenha() {
  const { token } = useParams();
  const [novaSenha, setNovaSenha] = useState('');
  const [valido, setValido] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://seusite.com/verificar-token/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.valido) setValido(true);
        else alert("Link expirado ou inválido");
      });
  }, [token]);

  function redefinirSenha(e) {
    e.preventDefault();

    fetch('https://seusite.com/redefinir-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, novaSenha })
    })
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          alert('Senha redefinida com sucesso!');
          navigate('/');
        } else {
          alert('Erro: ' + data.mensagem);
        }
      });
  }

  if (!valido) return <p>Verificando token...</p>;

  return (
    <form onSubmit={redefinirSenha}>
      <h2>Redefinir Senha</h2>
      <input
        type="password"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        placeholder="Nova senha"
      />
      <button type="submit">Salvar</button>
    </form>
  );
}
