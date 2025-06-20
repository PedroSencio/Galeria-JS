import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres', // Altere para seu usuário do PostgreSQL
  host: 'localhost',
  database: 'Galeria', // Altere para o nome do seu banco
  password: '1202', // Altere para sua senha
  port: 5432,
});



// Configuração do multer para salvar arquivos em uma pasta local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir); // Cria a pasta 'uploads' se ela não existir
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Define o nome do arquivo
  }
});

const upload = multer({ storage });

app.post('/usuarios', async (req, res) => {
  // Garante que o corpo está sendo recebido como JSON
  console.log('req.body:', req.body);
  const { nome, senha, email } = req.body || {};
  if (!nome || !senha || !email) {
    return res.status(400).json({ error: 'Nome, senha e email são obrigatórios.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO usuario (nome, senha, email) VALUES ($1, $2, $3) RETURNING *',
      [nome, senha, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { nome, senha } = req.body;
  console.log('Recebido na rota /login:', req.body); // Log detalhado

  if (!nome || !senha) {
    console.error('Erro: Campos obrigatórios não preenchidos.');
    return res.status(400).json({ sucesso: false, mensagem: 'Nome e senha são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM usuario WHERE nome = $1 AND senha = $2',
      [nome, senha]
    );

    if (result.rows.length > 0) {
      console.log('Login bem-sucedido para o usuário:', nome);
      res.json({ sucesso: true, usuario: result.rows[0] });
    } else {
      console.warn('Falha no login: Usuário ou senha incorretos.');
      res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha incorretos.' });
    }
  } catch (err) {
    console.error('Erro ao realizar login:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao realizar login.' });
  }
});
app.post('/add-foto', upload.array('foto'), async (req, res) => {
  const { usuario } = req.body;
  const files = req.files;

  if (!files || files.length === 0 || !usuario) {
    return res.status(400).json({ sucesso: false, mensagem: 'Arquivos e usuário são obrigatórios.' });
  }

  try {
    const userResult = await pool.query('SELECT id FROM usuario WHERE nome = $1', [usuario]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

    const userId = userResult.rows[0].id;

    for (const file of files) {
      const nomeSemExt = path.parse(file.filename).name;
      const novoNome = nomeSemExt + '.webp';
      const novoCaminho = path.join(__dirname, 'uploads', novoNome);

      await sharp(file.path)
        .resize(800)
        .toFormat('webp')
        .toFile(novoCaminho);

      fs.unlinkSync(file.path); // remove original

      await pool.query(
        'INSERT INTO fotos (usuario_id, caminho_arquivo, titulo, descricao) VALUES ($1, $2, $3, $4)',
        [userId, novoNome, '', '']
      );
    }

    res.json({ sucesso: true, mensagem: 'Todas as fotos foram salvas com sucesso!' });

  } catch (error) {
    console.error('Erro ao processar imagens:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar imagens.' });
  }
});


app.get('/fotos', async (req, res) => {
  const usuario = req.query.usuario;
  try {
    if (usuario) {
      // Busca apenas as fotos do usuário logado
      const userResult = await pool.query('SELECT id FROM usuario WHERE nome = $1', [usuario]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      const usuario_id = userResult.rows[0].id;
      const result = await pool.query('SELECT * FROM fotos WHERE usuario_id = $1', [usuario_id]);
      return res.json(result.rows);
    } else {
      // Se não passar usuário, retorna todas (opcional)
      const result = await pool.query('SELECT * FROM fotos');
      return res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Corrigir __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware global de erro
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ sucesso: false, mensagem: 'Erro no upload: ' + err.message });
  } else if (err) {
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno: ' + err.message });
  }
  next();
});
app.post('/add-foto-album', async (req, res) => {
  const { usuario, album_id, foto_id } = req.body;

  if (!usuario || !album_id || !foto_id) {
    return res.status(400).json({ sucesso: false, mensagem: 'Campos obrigatórios ausentes.' });
  }

  try {
    const userResult = await pool.query('SELECT id FROM usuario WHERE nome = $1', [usuario]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

    await pool.query(
      'UPDATE fotos SET album_id = $1 WHERE id = $2',
      [album_id, foto_id]
    );

    res.json({ sucesso: true, mensagem: 'Foto associada ao álbum com sucesso!' });
  } catch (err) {
    console.error('Erro ao associar foto:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno.' });
  }
});

app.post('/associar-foto-album', async (req, res) => {
  const { foto_id, album_id } = req.body;
  if (!foto_id || !album_id) {
    return res.status(400).json({ sucesso: false, mensagem: 'Campos obrigatórios ausentes.' });
  }

  try {
    await pool.query('UPDATE fotos SET album_id = $1 WHERE id = $2', [album_id, foto_id]);
    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao associar foto ao álbum.' });
  }
});

app.get('/fotos-album', async (req, res) => {
  const { album_id } = req.query;
  if (!album_id) return res.status(400).json({ sucesso: false, mensagem: 'ID do álbum ausente.' });

  try {
    const result = await pool.query('SELECT * FROM fotos WHERE album_id = $1', [album_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar fotos do álbum.' });
  }
});


app.post('/add-foto-album', upload.single('foto'), async (req, res) => {
  const { usuario, album_id, titulo, descricao } = req.body;
  const file = req.file;

  if (!usuario || !album_id || !file) {
    return res.status(400).json({ sucesso: false, mensagem: 'Campos obrigatórios ausentes.' });
  }

  try {
    const userResult = await pool.query('SELECT id FROM usuario WHERE nome = $1', [usuario]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

    const userId = userResult.rows[0].id;

    await pool.query(
      'INSERT INTO fotos (usuario_id, album_id, caminho_arquivo, titulo, descricao) VALUES ($1, $2, $3, $4, $5)',
      [userId, album_id, file.filename, titulo || '', descricao || '']
    );

    res.json({ sucesso: true, mensagem: 'Foto adicionada ao álbum com sucesso!' });

  } catch (err) {
    console.error('Erro ao adicionar foto ao álbum:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno.' });
  }
});

app.get('/albuns', async (req, res) => {
  const usuario = req.query.usuario;
  if (!usuario) return res.status(400).json({ sucesso: false, mensagem: 'Usuário não especificado.' });

  try {
    const userResult = await pool.query('SELECT id FROM usuario WHERE nome = $1', [usuario]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

    const usuario_id = userResult.rows[0].id;
    const albunsResult = await pool.query('SELECT * FROM albuns WHERE usuario_id = $1 ORDER BY criado_em DESC', [usuario_id]);

    res.json(albunsResult.rows);
  } catch (error) {
    console.error('Erro ao buscar álbuns:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao buscar álbuns.' });
  }
});
app.post('/add-capa-album', upload.single('capa'), async (req, res) => {
  const { usuario, album_id } = req.body;
  const file = req.file;

  if (!usuario || !album_id || !file) {
    return res.status(400).json({ sucesso: false, mensagem: 'Campos obrigatórios ausentes.' });
  }

  try {
    const userResult = await pool.query('SELECT id FROM usuario WHERE nome = $1', [usuario]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

    const usuario_id = userResult.rows[0].id;

    await pool.query(
      'UPDATE albuns SET capa = $1 WHERE id = $2 AND usuario_id = $3',
      [file.filename, album_id, usuario_id]
    );

    res.json({ sucesso: true, mensagem: 'Capa do álbum atualizada com sucesso!' });

  } catch (err) {
    console.error('Erro ao atualizar capa do álbum:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno.' });
  }
});


app.post('/albuns', upload.single('capa'), async (req, res) => {
  const { usuario, nome, descricao } = req.body;
  const file = req.file;

  if (!usuario || !nome) {
    return res.status(400).json({ sucesso: false, mensagem: 'Usuário e nome são obrigatórios.' });
  }

  try {
    const userResult = await pool.query('SELECT id FROM usuario WHERE nome = $1', [usuario]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

    const usuario_id = userResult.rows[0].id;
    const capaPath = file ? file.filename : null;

    await pool.query(
      'INSERT INTO albuns (usuario_id, nome, descricao, capa) VALUES ($1, $2, $3, $4)',
      [usuario_id, nome, descricao || '', capaPath]
    );

    res.json({ sucesso: true, mensagem: 'Álbum criado com sucesso!' });
  } catch (err) {
    console.error('Erro ao criar álbum:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao criar álbum.' });
  }
});

app.post('/email', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ sucesso: false, mensagem: 'Email não fornecido.' });
  }

  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,   
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }

  });

  const mailOptions = {
    from: 'pedrosencio2309@gmail.com', // seu email
    to: email,
    subject: 'Oieee',
    text: 'Seu amor te amaaa'
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar email:', error);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar email.' });
    }
    res.json({ sucesso: true, mensagem: 'Email enviado com sucesso!' });
  });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

