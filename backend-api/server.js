// D:\cvsumberalam\CVSUMBERALAM\backend-api\server.js

require('dotenv').config(); // Muat variabel lingkungan dari .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Page = require('./models/Page'); // Impor model Page

const app = express();
const PORT = process.env.PORT || 5000; // Gunakan port dari .env atau default 5000

// Middleware
app.use(cors()); // Izinkan semua permintaan lintas asal (untuk pengembangan)
app.use(express.json()); // Izinkan server membaca body permintaan sebagai JSON

// Koneksi Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Keluar dari aplikasi jika gagal koneksi database
  });

// --- API Routes untuk Manajemen Halaman ---

// @route   GET /api/pages
// @desc    Mendapatkan semua halaman
// @access  Public (untuk frontend publik)
app.get('/api/pages', async (req, res) => {
  try {
    const pages = await Page.find();
    res.json(pages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/pages/:name
// @desc    Mendapatkan halaman berdasarkan nama unik
// @access  Public (untuk frontend publik)
app.get('/api/pages/:name', async (req, res) => {
  try {
    const page = await Page.findOne({ name: req.params.name.toLowerCase() }); // Cari dengan nama lowercase
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }
    res.json(page);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/pages
// @desc    Membuat halaman baru
// @access  Private (Admin Only - perlu otentikasi)
app.post('/api/pages', async (req, res) => {
  const { name, content } = req.body;

  // Validasi dasar
  if (!name || !content) {
    return res.status(400).json({ msg: 'Nama dan konten halaman diperlukan.' });
  }

  try {
    let page = await Page.findOne({ name: name.toLowerCase() });
    if (page) {
      return res.status(400).json({ msg: 'Halaman dengan nama ini sudah ada.' });
    }

    const newPage = new Page({
      name: name.toLowerCase(), // Simpan nama dalam huruf kecil
      content
    });

    page = await newPage.save();
    res.status(201).json(page); // 201 Created
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/pages/:name
// @desc    Mengupdate halaman berdasarkan nama
// @access  Private (Admin Only - perlu otentikasi)
app.put('/api/pages/:name', async (req, res) => {
  const { content } = req.body; // Hanya izinkan update konten untuk kesederhanaan

  if (!content) {
    return res.status(400).json({ msg: 'Konten halaman diperlukan.' });
  }

  try {
    let page = await Page.findOne({ name: req.params.name.toLowerCase() });
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    page.content = content;
    page.lastUpdated = Date.now();

    await page.save();
    res.json(page);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/pages/:name
// @desc    Menghapus halaman berdasarkan nama
// @access  Private (Admin Only - perlu otentikasi)
app.delete('/api/pages/:name', async (req, res) => {
  try {
    const page = await Page.findOne({ name: req.params.name.toLowerCase() });
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    await Page.deleteOne({ _id: page._id }); // Hapus berdasarkan _id yang ditemukan
    res.json({ msg: 'Page removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Jalankan Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));