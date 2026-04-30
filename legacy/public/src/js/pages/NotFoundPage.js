export function renderNotFoundPage(userRole) {
  const rootElement = document.getElementById("root");

  const pageHTML = `
    <style>
      html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
      }
      html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
      }

      /* Desktop right padding to prevent content from touching right edge */
      @media (min-width: 1024px) {
        .page-not-found-container {
          padding-right: 1rem;
        }
      }
    </style>
    <div class="page-not-found-container flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans text-center p-8">
      <div class="flex flex-col justify-center bg-white rounded-xl p-12 shadow-lg max-w-lg w-full gap-4">
        <div class="text-8xl font-extrabold text-cyan-500 mb-2">404</div>
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Halaman Tidak dapat Ditemukan</h1>
        <a href="/login" class="bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-colors duration-300" data-link>Kembali ke Login</a>
      </div>
    </div>
  `;

  rootElement.innerHTML = pageHTML;
}
