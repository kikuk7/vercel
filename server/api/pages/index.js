import { getPages, createPage } from '~/server/utils/pagesData.js';

export default defineEventHandler(async (event) => {
  const method = event.req.method;

  if (method === 'GET') {
    return getPages(); // Mengembalikan semua halaman
  } else if (method === 'POST') {
    // Untuk menambahkan halaman baru
    // Anda perlu mengimplementasikan otentikasi/otorisasi yang tepat di sini!
    const body = await readBody(event);
    const newPage = createPage(body);
    return { message: 'Halaman berhasil ditambahkan', data: newPage };
  } else {
    event.res.statusCode = 405;
    return { message: 'Method Not Allowed' };
  }
});