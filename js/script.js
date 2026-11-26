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
document.getElementById('rsvpGuestName').value = document.querySelector('.nama-tamu').textContent.trim();

const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const musicPlayer = document.querySelector('.music-player');
const musicStatus = document.getElementById('musicStatus');
const musicIconPath = musicToggle.querySelector('.music-icon path');
const playIconPath = 'M8 5v14l11-7z';
const pauseIconPath = 'M7 5h4v14H7zm6 0h4v14h-4z';

function updateMusicButton(isPlaying) {
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicToggle.setAttribute('aria-label', isPlaying ? 'Jeda musik' : 'Putar musik');
    musicToggle.title = isPlaying ? 'Jeda musik' : 'Putar musik';
    musicIconPath.setAttribute('d', isPlaying ? pauseIconPath : playIconPath);
}

backgroundMusic.addEventListener('play', () => updateMusicButton(true));
backgroundMusic.addEventListener('pause', () => updateMusicButton(false));

async function playBackgroundMusic() {
    try {
        await backgroundMusic.play();
        updateMusicButton(true);
        musicStatus.textContent = '';
    } catch (error) {
        console.error('Musik tidak dapat diputar.', error);
        updateMusicButton(false);
        musicStatus.textContent = 'Musik tidak dapat diputar. Coba tekan tombol musik.';
    }
}

musicToggle.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        playBackgroundMusic();
        return;
    }

    backgroundMusic.pause();
    updateMusicButton(false);
});

document.querySelector('.open-invitation').addEventListener('click', (event) => {
    event.preventDefault();
    document.body.classList.remove('scroll-locked');
    musicPlayer.classList.add('is-visible');
    playBackgroundMusic();
    document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
});

async function copyAccountNumber(accountNumber) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(accountNumber);
        return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = accountNumber;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.append(textArea);
    textArea.select();
    const copied = document.execCommand('copy');
    textArea.remove();

    if (!copied) {
        throw new Error('Browser gagal menyalin nomor rekening.');
    }
}

const copyToast = document.getElementById('copyToast');
let copyToastTimeout;

function showCopyToast() {
    copyToast.textContent = 'Nomor rekening berhasil disalin.';
    copyToast.classList.add('show');
    window.clearTimeout(copyToastTimeout);
    copyToastTimeout = window.setTimeout(() => {
        copyToast.classList.remove('show');
    }, 2200);
}

document.querySelectorAll('.gift-copy-button').forEach((button) => {
    button.addEventListener('click', async () => {
        try {
            const accountNumber = button.closest('.gift-card')
                .querySelector('.gift-account-number')
                .textContent.replace(/\D/g, '');

            if (!accountNumber) {
                throw new Error('Nomor rekening belum diisi.');
            }

            await copyAccountNumber(accountNumber);
            button.textContent = 'Tersalin!';
            showCopyToast();
        } catch (error) {
            console.error('Gagal menyalin nomor rekening.', error);
            button.textContent = 'Gagal menyalin';
        }

        window.setTimeout(() => {
            button.textContent = 'Salin nomor';
        }, 1800);
    });
});

const supabaseUrl = 'https://qppcyynrjsrzcdmgyofy.supabase.co';
const supabasePublishableKey = 'sb_publishable_yo3A1NOdRFCoU4Qyoy1Y7A_cnqBwfBN';
const rsvpForm = document.getElementById('rsvpForm');
const rsvpStatus = document.getElementById('rsvpStatus');
const rsvpMessagesStatus = document.getElementById('rsvpMessagesStatus');
const rsvpMessagesList = document.getElementById('rsvpMessagesList');

async function getSupabaseError(response) {
    const responseText = await response.text();
    try {
        const error = JSON.parse(responseText);
        return [error.message, error.details, error.hint].filter(Boolean).join(' — ')
            || `HTTP ${response.status}`;
    } catch {
        return responseText || `HTTP ${response.status}`;
    }
}

function createRsvpMessage(entry) {
    const card = document.createElement('article');
    card.className = 'rsvp-message-card';

    const header = document.createElement('div');
    header.className = 'rsvp-message-header';

    const name = document.createElement('h4');
    name.textContent = entry.nama || 'Tamu Undangan';

    const attendance = document.createElement('span');
    attendance.className = 'rsvp-attendance';
    attendance.textContent = entry.kehadiran === 'Hadir'
        ? 'Hadir'
        : entry.kehadiran === 'Tidak Hadir'
            ? 'Tidak Hadir'
            : entry.kehadiran || 'Belum dikonfirmasi';

    header.append(name, attendance);

    const greeting = document.createElement('p');
    greeting.className = 'rsvp-message-greeting';
    greeting.textContent = entry.ucapan || '';

    card.append(header, greeting);

    if (entry.created_at) {
        const date = new Date(entry.created_at);
        if (!Number.isNaN(date.getTime())) {
            const time = document.createElement('time');
            time.className = 'rsvp-message-date';
            time.dateTime = date.toISOString();
            time.textContent = new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(date);
            card.append(time);
        }
    }

    return card;
}

async function loadRsvpMessages() {
    rsvpMessagesStatus.textContent = 'Memuat ucapan...';
    rsvpMessagesList.replaceChildren();

    try {
        const query = new URLSearchParams({
            select: 'nama,ucapan,kehadiran,created_at',
            order: 'created_at.desc',
            limit: '100',
        });
        const response = await fetch(`${supabaseUrl}/rest/v1/rsvp_asas?${query}`, {
            headers: {
                apikey: supabasePublishableKey,
            },
        });

        if (!response.ok) {
            throw new Error(await getSupabaseError(response));
        }

        const entries = await response.json();
        if (!Array.isArray(entries)) {
            throw new Error('Format data ucapan tidak valid.');
        }

        if (entries.length === 0) {
            rsvpMessagesStatus.textContent = 'Belum ada ucapan. Jadilah yang pertama mengirim!';
            return;
        }

        rsvpMessagesList.replaceChildren(...entries.map(createRsvpMessage));
        rsvpMessagesStatus.textContent = `${entries.length} ucapan terbaru`;
    } catch (error) {
        console.error('Gagal memuat ucapan RSVP.', error);
        rsvpMessagesStatus.textContent = 'Ucapan belum dapat dimuat. Periksa izin baca tabel RSVP.';
    }
}

rsvpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = document.getElementById('rsvpSubmit');
    const formData = new FormData(rsvpForm);
    if (formData.get('website')) {
        rsvpStatus.textContent = 'RSVP belum terkirim. Silakan coba lagi.';
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Mengirim...';
    rsvpStatus.textContent = '';

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rsvp_asas`, {
            method: 'POST',
            headers: {
                apikey: supabasePublishableKey,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            body: JSON.stringify({
                nama: formData.get('guestName'),
                ucapan: formData.get('greeting'),
                kehadiran: formData.get('attendance'),
            }),
        });

        if (!response.ok) {
            throw new Error(await getSupabaseError(response));
        }

        rsvpStatus.textContent = 'Terima kasih, RSVP Anda berhasil dikirim.';
        rsvpForm.elements.greeting.value = '';
        rsvpForm.elements.attendance.value = '';
        await loadRsvpMessages();
    } catch (error) {
        console.error('Gagal mengirim RSVP.', error);
        rsvpStatus.textContent = error instanceof Error
            ? `RSVP gagal: ${error.message}`
            : 'RSVP belum terkirim. Silakan coba lagi.';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Kirim RSVP';
    }
});

loadRsvpMessages();