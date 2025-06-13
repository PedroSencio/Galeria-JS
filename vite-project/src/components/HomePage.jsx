import './HomePage.css';
import { useRef, useState, useEffect } from 'react';

export default function HomePage({ NomeLogin }) {
  const inputRef = useRef(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomSrc, setZoomSrc] = useState(null);
  const [trocarPagina, setTrocarPagina] = useState(0);
  const [albuns, setAlbuns] = useState([]);
  const [albumIdParaCapa, setAlbumIdParaCapa] = useState(null);
  const [albumSelecionado, setAlbumSelecionado] = useState(null);
  const [fotosDoAlbum, setFotosDoAlbum] = useState([]);
  const [mostrarFotosDisponiveis, setMostrarFotosDisponiveis] = useState(false);




  const associarFotoAoAlbum = async (fotoId) => {
  try {
    const response = await fetch('http://localhost:3001/associar-foto-album', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        foto_id: fotoId,
        album_id: albumSelecionado.id
      }),
    });
    const data = await response.json();
    if (data.sucesso) abrirDetalhesDoAlbum(albumSelecionado);
    else alert(data.mensagem);
  } catch (err) {
    console.error('Erro ao associar foto:', err);
  }
};


  const handleTrocarPagina = (pagina) => {
    setTrocarPagina(pagina);
  };

  const handleAddFoto = () => {
    inputRef.current?.click();
  };

  const abrirAlbumParaAdicionar = async (albumId) => {
  setAlbumSelecionado(albumId);
  setTrocarPagina(5); // Página de associação de fotos
  await atualizarFotos(); // Carrega todas as fotos existentes
};

  const buscarFotosDoAlbum = async (albumId) => {
  try {
    const response = await fetch(`http://localhost:3001/fotos?album_id=${albumId}`);
    const data = await response.json();
    if (Array.isArray(data)) {
      setFotos(data);
      setAlbumSelecionado(albumId);
      setTrocarPagina(5); // nova página exclusiva para o álbum
    }
  } catch (err) {
    console.error('Erro ao buscar fotos do álbum:', err);
  }
};


    const abrirDetalhesDoAlbum = async (album) => {
  setAlbumSelecionado(album);
  setTrocarPagina('albumDetalhes');

  try {
    const response = await fetch(`http://localhost:3001/fotos-album?album_id=${album.id}`);
    const data = await response.json();
    setFotosDoAlbum(data);
  } catch (error) {
    console.error('Erro ao carregar fotos do álbum:', error);
    setFotosDoAlbum([]);
  }
};


  const abrirInputComSeguranca = (albumId) => {
    setAlbumIdParaCapa(albumId);
    const tentarAbrir = () => {
      if (inputRef.current) {
        inputRef.current.click();
      } else {
        setTimeout(tentarAbrir, 50);
      }
    };
    tentarAbrir();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    const usuario = localStorage.getItem('usuario');
    if (!files || !usuario) return;

    // Se for capa de álbum
    if (albumIdParaCapa) {
      const formData = new FormData();
      formData.append('capa', files[0]);
      formData.append('album_id', albumIdParaCapa);
      formData.append('usuario', usuario);

      try {
        const response = await fetch('http://localhost:3001/add-capa-album', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.sucesso) {
          atualizarAlbuns();
        } else {
          alert(data.mensagem || 'Erro ao adicionar capa ao álbum.');
        }
      } catch (error) {
        console.error('Erro ao adicionar capa ao álbum:', error);
      }

      setAlbumIdParaCapa(null);
      return;
    }

    // Upload comum de fotos
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('foto', files[i]);
      formData.append('usuario', usuario);

      try {
        const response = await fetch('http://localhost:3001/add-foto', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (!data.sucesso) {
          alert(`Erro ao enviar a ${files[i].name}: ${data.mensagem}`);
        }
      } catch (error) {
        console.error(`Erro ao enviar ${files[i].name}:`, error);
      }
    }

    atualizarFotos();
  };

  const atualizarAlbuns = () => {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) return;

    fetch(`http://localhost:3001/albuns?usuario=${encodeURIComponent(usuario)}`)
      .then(res => res.json())
      .then(data => {
        setAlbuns(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Erro ao carregar álbuns:", err);
        setAlbuns([]);
      });
  };

  const handleAddFotoAoAlbum = async (e) => {
  const file = e.target.files[0];
  if (!file || !albumSelecionado) return;
  const usuario = localStorage.getItem('usuario');

  const formData = new FormData();
  formData.append('foto', file);
  formData.append('album_id', albumSelecionado);
  formData.append('usuario', usuario);

  try {
    const response = await fetch('http://localhost:3001/add-foto-album', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.sucesso) {
      buscarFotosDoAlbum(albumSelecionado); // Atualiza as fotos
    } else {
      alert(data.mensagem || 'Erro ao adicionar foto.');
    }
  } catch (error) {
    console.error('Erro ao adicionar foto ao álbum:', error);
  }
};

  const atualizarFotos = () => {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) return;

    fetch(`http://localhost:3001/fotos?usuario=${encodeURIComponent(usuario)}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar fotos');
        return res.json();
      })
      .then(data => {
        setFotos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar fotos:', error);
        setFotos([]);
        setLoading(false);
      });
  };

  const handleAddAlbum = async () => {
    const nome = prompt("Nome do álbum:");
    const descricao = prompt("Descrição do álbum:");
    const capaFile = window.confirm("Deseja adicionar uma foto de capa?") ? await selectImageFile() : null;

    const usuario = localStorage.getItem("usuario");
    if (!usuario || !nome) return;

    const formData = new FormData();
    formData.append("usuario", usuario);
    formData.append("nome", nome);
    formData.append("descricao", descricao || "");
    if (capaFile) {
      formData.append("capa", capaFile);
    }

    try {
      const response = await fetch("http://localhost:3001/albuns", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (data.sucesso) {
        atualizarAlbuns();
      } else {
        alert("Erro ao criar álbum: " + data.mensagem);
      }
    } catch (error) {
      console.error("Erro ao criar álbum:", error);
    }
  };

  const selectImageFile = () => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => resolve(input.files[0]);
      input.click();
    });
  };

  const Zoom = (e) => {
    const img = e.target;
    if (img.tagName === 'IMG') {
      setZoomSrc(img.src);
    }
  };

  const renderPagina = () => {
    switch (trocarPagina) {
      case 0:
        return (
          <div>
            <div className='top-inicio'><h1>Álbuns</h1></div>
            <div id='mid'>
              <div className='txt'><h1>Fotos</h1></div>
              <div className='mid-fotos1'>
                {loading ? <p>Carregando...</p> :
                  fotos.length > 0 ? fotos.map((foto, index) => (
                    <div key={index} className='foto-item1'>
                      <img className='foto1' src={`http://localhost:3001/uploads/${foto.caminho_arquivo}`} alt={foto.titulo || 'Foto'} onClick={Zoom} loading="lazy" />
                      <p>{foto.titulo}</p>
                    </div>
                  )) : <p>Nenhuma foto encontrada.</p>}
              </div>
            </div>
            {renderDock()}
          </div>
        );
      case 1:
        return (
          <div>
            <div className='top-fotos'><h1>Galeria de fotos</h1></div>
            <div className='mid-fotos'>
              {loading ? <p>Carregando...</p> :
                fotos.length > 0 ? fotos.map((foto, index) => (
                  <div key={index} className='foto-item'>
                    <img className='foto' src={`http://localhost:3001/uploads/${foto.caminho_arquivo}`} alt={foto.titulo || 'Foto'} onClick={Zoom} />
                    <p>{foto.titulo}</p>
                  </div>
                )) : <p>Nenhuma foto encontrada.</p>}
            </div>
            {renderDock()}
            <div className='bottom-fotos'>
              <button className='add-foto' onClick={handleAddFoto}>+</button>
            </div>
          </div>
        );
      case 2:
        return (
          <div id='all'>
            <div className='top-albuns'>
              <h1 style={{ display: 'inline-block', marginRight: '20px' }}>Álbuns</h1>
              <button className='add-album' onClick={handleAddAlbum}>+</button>
            </div>
            <div className='albuns-list'>
              {albuns.length > 0 ? albuns.map((album, index) => (
                <div key={index} className='album-item' onClick={() => abrirDetalhesDoAlbum(album)}
                >
                  <div id='left'>
                    {album.capa ? (
                      <img className='album-capa' src={`http://localhost:3001/uploads/${album.capa}`} alt={album.nome} onClick={() => handleTrocarPagina(1)} />
                    ) : (
                      <div className='album-sem-capa'>
                        <button id='add-capa-album' onClick={() => handleFileChange(album.id)}>Sem capa</button>
                      </div>
                    )}
                  </div>
                  <div id='right'>
                    {album.nome && <h2 className='album-nome'>Nome: {album.nome}</h2>}
                    {album.descricao && <p className='album-descricao'>{album.descricao}</p>}
                  </div>
                </div>
              )) : <p>Nenhum álbum encontrado.</p>}
            </div>
            {renderDock()}
          </div>
        );
      case 3:
        return <div>Favoritos</div>;
      case 4:
        return <div>Configurações</div>;
    case 'albumDetalhes':
  return (
    <div className='album-detalhes'>
      <div className='top-bar'>
        <button onClick={() => setTrocarPagina(2)}>◀︎</button>
        <h2>Fotos do Álbum: {albumSelecionado?.nome}</h2>
      </div>

      <div className='conteudo-album'>
        {fotosDoAlbum.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>Nenhuma imagem associada a este álbum.</p>
        ) : (
          <div className='fotos-album'>
            {fotosDoAlbum.map((foto, index) => (
              <div key={index}>
                <img
                  src={`http://localhost:3001/uploads/${foto.caminho_arquivo}`}
                  alt={foto.titulo}
                  className='foto-album'
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='botoes-fundo'>
        <button onClick={() => setMostrarFotosDisponiveis(true)}>+ Adicionar Foto</button>
      </div>

      <div id='bottom'>
        <div className='dock'>
          <button className='btn' onClick={() => setTrocarPagina(0)}>Início</button>
          <button className='btn' onClick={() => setTrocarPagina(1)}>Fotos</button>
          <button className='btn active' onClick={() => setTrocarPagina(2)}>Álbuns</button>
          <button className='btn' onClick={() => setTrocarPagina(3)}>Favoritos</button>
          <button className='btn' onClick={() => setTrocarPagina(4)}>Configurações</button>
        </div>
      </div>

      {mostrarFotosDisponiveis && (
        <div className='fotos-disponiveis'>
          <h4>Escolha fotos para adicionar:</h4>
          <div className='grid-fotos'>
            {fotos.map(foto => (
              <img
                key={foto.id}
                src={`http://localhost:3001/uploads/${foto.caminho_arquivo}`}
                alt={foto.titulo}
                className='foto-miniatura'
                onClick={() => associarFotoAoAlbum(foto.id)}
              />
            ))}
          </div>
          <button onClick={() => setMostrarFotosDisponiveis(false)}>Fechar</button>
        </div>
      )}
    </div>
  );


      default:
        return <div>Página não encontrada</div>;
    }
  };

  const renderDock = () => (
    <div id='bottom'>
      <div className='dock'>
        <button className={`btn ${trocarPagina === 0 ? 'active' : ''}`} onClick={() => handleTrocarPagina(0)}>Início</button>
        <button className={`btn ${trocarPagina === 1 ? 'active' : ''}`} onClick={() => handleTrocarPagina(1)}>Fotos</button>
        <button className={`btn ${trocarPagina === 2 ? 'active' : ''}`} onClick={() => handleTrocarPagina(2)}>Álbuns</button>
        <button className={`btn ${trocarPagina === 3 ? 'active' : ''}`} onClick={() => handleTrocarPagina(3)}>Favoritos</button>
        <button className={`btn ${trocarPagina === 4 ? 'active' : ''}`} onClick={() => handleTrocarPagina(4)}>Configurações</button>
      </div>
    </div>
  );

  useEffect(() => {
    atualizarFotos();
    atualizarAlbuns();
  }, []);

  return (
    <div id='all'>
      {renderPagina()}
      <input
        type="file"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*"
        multiple
      />
    </div>
  );
}
