import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function RedefinirSenha() {
  const { token } = useParams();
  const [valido, setValido] = useState(null);

  useEffect(() => {
    axios.get(`https://galeria-js.onrender.com/verificar-token/${token}`)
      .then(res => setValido(res.data.valido))
      .catch(() => setValido(false));
  }, [token]);

  const alterarSenha = (e) => {
    e.preventDefault();
    const novaSenha = e.target.elements[0].value;

    axios.post(`https://galeria-js.onrender.com/redefinir-senha/${token}`, { senha: novaSenha })
      .then(res => {
        if (res.data.sucesso) {
          alert('Senha alterada com sucesso!');
        } else {
          alert('Erro ao alterar a senha. Tente novamente.');
        }
      })
      .catch(() => {
        alert('Erro ao alterar a senha. Tente novamente.');
      });
  };

  if (valido === null) return <p>Verificando token...</p>;
  if (!valido) return <p>Token inválido ou expirado.</p>;

  return (
    <div>
      <h2>Redefinir Senha</h2>
      <form onSubmit={alterarSenha}>
        <input type="password" placeholder="Nova senha" required />
        <button type="submit">Salvar nova senha</button>
      </form>
    </div>
  );
}
