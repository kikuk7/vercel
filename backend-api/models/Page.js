// D:\cvsumberalam\CVSUMBERALAM\backend-api\models\Page.js

const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  name: { // Misalnya 'beranda', 'tentang', 'produk' - akan jadi ID unik untuk halaman
    type: String,
    required: true,
    unique: true,
    lowercase: true // Simpan nama halaman dalam huruf kecil untuk konsistensi
  },
  content: { // Konten HTML atau data yang akan dirender di halaman
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Page', PageSchema);