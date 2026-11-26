const params = new URLSearchParams(window.location.search);
document.getElementById('nama-tamu').textContent = params.get('to') || 'Tamu Undangan';