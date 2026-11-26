if (typeof window.AOS !== 'undefined') {
    window.AOS.init({ offset: -120 });
}

if (typeof window.simplyCountdown === 'function') {
    window.simplyCountdown('.simply-countdown', {
        year: 2027,
        month: 4,
        day: 26,
        hours: 2,
        minutes: 0,
        seconds: 0,
        enableUtc: true,
        zeroPad: true,
        words: {
            days: { singular: 'hari', plural: 'hari' },
            hours: { singular: 'jam', plural: 'jam' },
            minutes: { singular: 'menit', plural: 'menit' },
            seconds: { singular: 'detik', plural: 'detik' },
        },
    });
} else {
    console.error('SimplyCountdown gagal dimuat; menggunakan countdown cadangan.');

    const countdown = document.querySelector('.simply-countdown');
    const units = [
        ['days', 'hari'],
        ['hours', 'jam'],
        ['minutes', 'menit'],
        ['seconds', 'detik'],
    ];
    const amounts = {};

    units.forEach(([unit, label]) => {
        const section = document.createElement('div');
        section.className = 'simply-section';

        const amount = document.createElement('span');
        amount.className = 'simply-amount';
        section.append(amount);
        amounts[unit] = amount;

        const word = document.createElement('span');
        word.className = 'simply-word';
        word.textContent = label;
        section.append(word);
        countdown.append(section);
    });

    const targetTime = Date.UTC(2027, 3, 26, 2);
    const updateCountdown = () => {
        const remaining = Math.max(0, targetTime - Date.now());
        const values = {
            days: Math.floor(remaining / 86400000),
            hours: Math.floor((remaining / 3600000) % 24),
            minutes: Math.floor((remaining / 60000) % 60),
            seconds: Math.floor((remaining / 1000) % 60),
        };

        units.forEach(([unit]) => {
            amounts[unit].textContent = String(values[unit]).padStart(2, '0');
        });
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
}

const params = new URLSearchParams(window.location.search);
document.getElementById('nama-tamu').textContent = params.get('to') || 'Tamu Undangan';

document.querySelector('.open-invitation').addEventListener('click', (event) => {
    event.preventDefault();
    document.body.classList.remove('scroll-locked');
    document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
});