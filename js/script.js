AOS.init({ offset: -120 });

const params = new URLSearchParams(window.location.search);
document.getElementById('nama-tamu').textContent = params.get('to') || 'Tamu Undangan';

document.querySelector('.open-invitation').addEventListener('click', (event) => {
    event.preventDefault();
    document.body.classList.remove('scroll-locked');
    document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
});