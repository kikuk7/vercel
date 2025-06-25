import { findPageById, updatePage, deletePage } from '~/server/utils/pagesData.js';

export default defineEventHandler(async (event) => {
  const pageId = event.context.params.id; // Mengambil ID dari URL
  const method = event.req.method;

  if (method === 'GET') {
    const page = findPageById(pageId);
    if (page) {
      return page;
    } else {
      event.res.statusCode = 404;
      return { message: 'Halaman tidak ditemukan' };
    }
  } else if (method === 'PUT') {
    // Untuk mengupdate halaman
    // Anda perlu mengimplementasikan otentikasi/otorisasi yang tepat di sini!
    const body = await readBody(event);
    const updatedPage = updatePage(pageId, body);
    if (updatedPage) {
      return { message: 'Halaman berhasil diperbarui', data: updatedPage };
    } else {
      event.res.statusCode = 404;
      return { message: 'Halaman tidak ditemukan' };
    }
  } else if (method === 'DELETE') {
    // Untuk menghapus halaman
    // Anda perlu mengimplementasikan otentikasi/otorisasi yang tepat di sini!
    const isDeleted = deletePage(pageId);
    if (isDeleted) {
      return { message: 'Halaman berhasil dihapus' };
    } else {
      event.res.statusCode = 404;
      return { message: 'Halaman tidak ditemukan' };
    }
  } else {
    event.res.statusCode = 405;
    return { message: 'Method Not Allowed' };
  }
});