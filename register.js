// ============================================================
// IGITA 2026 — REGISTRATION SYSTEM
// Validasi diperkuat: HP, Email, Instagram, Nama, File
// ============================================================
(function() {
  const overlay   = document.getElementById('reg-overlay');
  const modal     = document.getElementById('reg-modal');
  const closeBtn  = document.getElementById('reg-close-btn');
  const btnNext   = document.getElementById('btn-next');
  const btnBack   = document.getElementById('btn-back');
  const btnSubmit = document.getElementById('btn-submit');
  const regFooter = document.getElementById('reg-footer');
  const stepText  = document.getElementById('step-indicator-text');

  let currentStep = 1;
  const TOTAL_STEPS = 3;

  // ============================================================
  // ATURAN VALIDASI
  // ============================================================

  // No HP: wajib diawali 08, panjang 10-13 digit, hanya angka & strip
  function isValidHP(v) {
    const clean = v.replace(/[\s\-]/g, '');
    return /^08\d{8,11}$/.test(clean);
  }

  // Email: harus ada @ dan domain yang umum dipakai
  const VALID_EMAIL_DOMAINS = [
    'gmail.com', 'yahoo.com', 'yahoo.co.id',
    'outlook.com', 'hotmail.com', 'live.com',
    'icloud.com', 'me.com',
    'kwikkiangie.ac.id', 'binus.ac.id',
    'student.kwikkiangie.ac.id',
  ];
  function isValidEmail(v) {
    const lower = v.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower)) return false;
    const domain = lower.split('@')[1];
    // Izinkan semua domain .ac.id dan .edu secara otomatis
    if (domain.endsWith('.ac.id') || domain.endsWith('.edu')) return true;
    return VALID_EMAIL_DOMAINS.includes(domain);
  }

  // Instagram: wajib diawali @, min 4 karakter total, hanya huruf/angka/titik/underscore
  function isValidIG(v) {
    return /^@[a-zA-Z0-9._]{1,}$/.test(v.trim()) && v.trim().length >= 4;
  }

  // Nama: min 3 karakter, hanya huruf & spasi (tidak boleh angka/simbol)
  function isValidNama(v) {
    return v.trim().length >= 3 && /^[a-zA-Z\s'.\-]+$/.test(v.trim());
  }

  // Nama Tim: min 3 karakter, bebas
  function isValidNamaTim(v) {
    return v.trim().length >= 3;
  }

  // File: jpg/png/pdf, max 2MB
  function isValidFile(file) {
    if (!file) return { ok: false, msg: 'Bukti pembayaran wajib diunggah.' };
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) return { ok: false, msg: 'Format file tidak valid. Gunakan JPG, PNG, atau PDF.' };
    if (file.size > 2 * 1024 * 1024) return { ok: false, msg: 'Ukuran file melebihi 2MB. Kompres atau pilih file lain.' };
    return { ok: true };
  }

  // ============================================================
  // PESAN ERROR DETAIL
  // ============================================================
  const ERR_MSG = {
    nama    : 'Nama harus min. 3 huruf, tidak boleh mengandung angka atau simbol.',
    email   : 'Email tidak valid. Gunakan Gmail, Yahoo, Outlook, atau email kampus.',
    hp      : 'No. HP harus diawali 08 dan terdiri dari 10–13 digit.',
    ig      : 'Akun Instagram harus diawali @ (contoh: @namaakun).',
    namaTim : 'Nama tim minimal 3 karakter.',
    institusi: 'Asal sekolah/institusi wajib diisi (min. 3 karakter).',
  };

  // ============================================================
  // HELPER FUNGSI
  // ============================================================
  function showErr(id, show, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('visible', show);
    if (show && msg) el.textContent = msg;
  }
  function setInputErr(id, hasErr) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('error', hasErr);
  }
  function setInputOk(id, isOk) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('valid', isOk);
  }

  // ============================================================
  // AUTO-FORMAT INPUT SAAT USER MENGETIK
  // ============================================================

  // Auto-format HP: hanya izinkan angka dan awalan 08
  function setupHPInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      // Hapus semua kecuali angka
      let val = el.value.replace(/[^\d]/g, '');
      // Batasi maks 13 digit
      if (val.length > 13) val = val.slice(0, 13);
      el.value = val;
    });
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (val.length > 0 && !val.startsWith('08')) {
        showErr('err-' + id, true, 'No. HP harus diawali 08. Contoh: 081234567890');
        setInputErr(id, true);
        setInputOk(id, false);
      } else if (val.length > 0 && isValidHP(val)) {
        showErr('err-' + id, false);
        setInputErr(id, false);
        setInputOk(id, true);
      } else if (val.length > 0) {
        showErr('err-' + id, true, ERR_MSG.hp);
        setInputErr(id, true);
        setInputOk(id, false);
      }
    });
  }

  // Auto-format IG: otomatis tambahkan @ di depan jika belum ada
  function setupIGInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocapitalize', 'off');
    el.setAttribute('spellcheck', 'false');

    el.addEventListener('blur', () => {
      let val = el.value.trim();
      if (val.length > 0 && !val.startsWith('@')) {
        val = '@' + val;
        el.value = val;
      }
      if (val.length > 0) {
        const valid = isValidIG(val);
        showErr('err-' + id, !valid, valid ? '' : ERR_MSG.ig);
        setInputErr(id, !valid);
        setInputOk(id, valid);
      }
    });
  }

  // Real-time email feedback
  function setupEmailInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('autocapitalize', 'off');
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (val.length > 0) {
        const valid = isValidEmail(val);
        showErr('err-' + id, !valid, valid ? '' : ERR_MSG.email);
        setInputErr(id, !valid);
        setInputOk(id, valid);
      }
    });
  }

  // Real-time nama feedback
  function setupNamaInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (val.length > 0) {
        const valid = isValidNama(val);
        showErr('err-' + id, !valid, valid ? '' : ERR_MSG.nama);
        setInputErr(id, !valid);
        setInputOk(id, valid);
      }
    });
  }

  // File upload feedback
  function setupFileInput() {
    const fileInput = document.getElementById('bukti-bayar');
    const helper    = fileInput?.closest('.form-group')?.querySelector('.form-helper');
    if (!fileInput) return;
    fileInput.addEventListener('change', () => {
      const file   = fileInput.files[0];
      const result = isValidFile(file);
      if (!result.ok) {
        showErr('err-bukti-bayar', true, result.msg);
        setInputErr('bukti-bayar', true);
        if (helper) { helper.textContent = 'Format: JPG, PNG, atau PDF. Maksimal 2MB.'; helper.style.color = ''; }
        fileInput.value = '';
      } else {
        showErr('err-bukti-bayar', false);
        setInputErr('bukti-bayar', false);
        const kb = (file.size / 1024).toFixed(0);
        if (helper) {
          helper.textContent = '✓ ' + file.name + ' (' + kb + ' KB)';
          helper.style.color = 'var(--accent, #00e676)';
        }
      }
    });
  }

  // Inisialisasi semua real-time input setup
  function initInputSetup() {
    for (let i = 1; i <= 5; i++) {
      setupNamaInput(`m${i}-nama`);
      setupEmailInput(`m${i}-email`);
      setupHPInput(`m${i}-hp`);
      setupIGInput(`m${i}-ig`);
    }
    setupFileInput();
  }

  // ============================================================
  // CATEGORY CARD SELECTION
  // ============================================================
  document.querySelectorAll('.cat-select-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.cat-select-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        const rowInst = document.getElementById('row-asal-institusi');
        if (rowInst) {
          if (radio.value === 'internal') {
            rowInst.style.display = 'none';
            setInputErr('asal-institusi', false);
            showErr('err-asal-institusi', false);
          } else {
            rowInst.style.display = '';
          }
        }
      }
    });
  });

  // ============================================================
  // VALIDASI PER STEP
  // ============================================================
  function validateStep1() {
    let ok = true;

    const kat = document.querySelector('input[name="kategori"]:checked');
    showErr('err-kategori', !kat);
    if (!kat) ok = false;

    const namaTimVal = document.getElementById('nama-tim').value.trim();
    const badNamaTim = !isValidNamaTim(namaTimVal);
    setInputErr('nama-tim', badNamaTim);
    setInputOk('nama-tim', !badNamaTim && namaTimVal.length > 0);
    showErr('err-nama-tim', badNamaTim, badNamaTim ? ERR_MSG.namaTim : '');
    if (badNamaTim) ok = false;

    if (kat && kat.value === 'external') {
      const instVal = document.getElementById('asal-institusi').value.trim();
      const badInst = instVal.length < 3;
      setInputErr('asal-institusi', badInst);
      setInputOk('asal-institusi', !badInst);
      showErr('err-asal-institusi', badInst, badInst ? ERR_MSG.institusi : '');
      if (badInst) ok = false;
    } else {
      setInputErr('asal-institusi', false);
      showErr('err-asal-institusi', false);
    }

    return ok;
  }

  function validateStep2() {
    let ok = true;
    let firstErrEl = null;

    const members = [
      { id: 1, req: true },
      { id: 2, req: true },
      { id: 3, req: true },
      { id: 4, req: true },
      { id: 5, req: false },
    ];

    members.forEach(m => {
      const namId = `m${m.id}-nama`;
      const emId  = `m${m.id}-email`;
      const hpId  = `m${m.id}-hp`;
      const igId  = `m${m.id}-ig`;

      const namVal = document.getElementById(namId)?.value.trim() || '';
      const emVal  = document.getElementById(emId)?.value.trim()  || '';
      const hpVal  = document.getElementById(hpId)?.value.trim()  || '';
      const igVal  = document.getElementById(igId)?.value.trim()  || '';

      // Cadangan: kalau semua kosong, skip
      if (!m.req && !namVal && !emVal && !hpVal && !igVal) {
        [namId, emId, hpId, igId].forEach(id => {
          setInputErr(id, false); setInputOk(id, false);
          showErr(`err-${id}`, false);
        });
        return;
      }

      // Nama
      const badNam = !isValidNama(namVal);
      setInputErr(namId, badNam); setInputOk(namId, !badNam);
      showErr(`err-${namId}`, badNam, badNam ? ERR_MSG.nama : '');
      if (badNam) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(namId); }

      // Email
      const badEm = !isValidEmail(emVal);
      setInputErr(emId, badEm); setInputOk(emId, !badEm);
      showErr(`err-${emId}`, badEm, badEm ? ERR_MSG.email : '');
      if (badEm) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(emId); }

      // HP
      const badHp = !isValidHP(hpVal);
      setInputErr(hpId, badHp); setInputOk(hpId, !badHp);
      showErr(`err-${hpId}`, badHp, badHp ? ERR_MSG.hp : '');
      if (badHp) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(hpId); }

      // Instagram — auto-add @ jika belum ada sebelum validasi
      let igFinal = igVal;
      if (igFinal.length > 0 && !igFinal.startsWith('@')) {
        igFinal = '@' + igFinal;
        const igEl = document.getElementById(igId);
        if (igEl) igEl.value = igFinal;
      }
      const badIg = !isValidIG(igFinal);
      setInputErr(igId, badIg); setInputOk(igId, !badIg);
      showErr(`err-${igId}`, badIg, badIg ? ERR_MSG.ig : '');
      if (badIg) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(igId); }
    });

    // Scroll ke field pertama yang error
    if (firstErrEl) {
      firstErrEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrEl.focus();
    }

    return ok;
  }

  function validateStep3() {
    let ok = true;

    const fileInput = document.getElementById('bukti-bayar');
    const file      = fileInput?.files[0];
    const fileCheck = isValidFile(file);
    setInputErr('bukti-bayar', !fileCheck.ok);
    showErr('err-bukti-bayar', !fileCheck.ok, fileCheck.msg || '');
    if (!fileCheck.ok) ok = false;

    const agreed = document.getElementById('agree-check').checked;
    showErr('err-agree', !agreed);
    document.getElementById('agree-wrap').style.borderColor = agreed ? '' : 'rgba(255,80,80,0.4)';
    if (!agreed) ok = false;

    return ok;
  }

  // ============================================================
  // STEP NAVIGATION UI
  // ============================================================
  function updateStepUI() {
    document.querySelectorAll('.reg-panel').forEach((p, i) => {
      p.classList.toggle('active', i + 1 === currentStep);
    });
    document.querySelectorAll('.reg-step').forEach((s, i) => {
      const n = i + 1;
      s.classList.remove('active', 'done');
      if (n < currentStep) s.classList.add('done');
      if (n === currentStep) s.classList.add('active');
    });
    document.getElementById('conn-1-2').classList.toggle('done', currentStep > 1);
    document.getElementById('conn-2-3').classList.toggle('done', currentStep > 2);

    btnBack.style.display = currentStep > 1 ? 'inline-flex' : 'none';
    const isLast = currentStep === TOTAL_STEPS;
    btnNext.style.display   = isLast ? 'none' : 'inline-flex';
    btnSubmit.classList.toggle('visible', isLast);

    stepText.textContent = 'Langkah ' + currentStep + ' dari ' + TOTAL_STEPS;

    // Scroll modal ke atas
    const regBody = modal.querySelector('.reg-body') || modal;
    regBody.scrollTop = 0;
  }

  btnNext.addEventListener('click', () => {
    let valid = false;
    if (currentStep === 1) valid = validateStep1();
    else if (currentStep === 2) valid = validateStep2();
    if (valid && currentStep < TOTAL_STEPS) {
      currentStep++;
      updateStepUI();
    }
  });

  btnBack.addEventListener('click', () => {
    if (currentStep > 1) { currentStep--; updateStepUI(); }
  });

  // ============================================================
  // GENERATE KODE REGISTRASI
  // ============================================================
  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'IGITA-2026-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  // ============================================================
  // SUBMIT — KIRIM KE GOOGLE SHEETS
  // ============================================================
  btnSubmit.addEventListener('click', async () => {
    if (!validateStep3()) return;

    btnSubmit.classList.add('loading');
    btnSubmit.disabled = true;
    btnBack.disabled   = true;

    try {
      const get = (id) => (document.getElementById(id)?.value || '').trim();
      const kat      = document.querySelector('input[name="kategori"]:checked')?.value;
      const katLabel = kat === 'internal' ? 'Internal – Mahasiswa KKG' : 'Eksternal – SMA/SMK';
      const kode     = generateCode();

      const formData = {
        kodeRegistrasi : kode,
        timestamp      : new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        kategori       : katLabel,
        namaTim        : get('nama-tim'),
        institusi      : kat === 'internal' ? 'Internal KKG' : get('asal-institusi'),
        a1_nama  : get('m1-nama'),  a1_email : get('m1-email'),
        a1_hp    : get('m1-hp'),    a1_ig    : get('m1-ig'),
        a2_nama  : get('m2-nama'),  a2_email : get('m2-email'),
        a2_hp    : get('m2-hp'),    a2_ig    : get('m2-ig'),
        a3_nama  : get('m3-nama'),  a3_email : get('m3-email'),
        a3_hp    : get('m3-hp'),    a3_ig    : get('m3-ig'),
        a4_nama  : get('m4-nama'),  a4_email : get('m4-email'),
        a4_hp    : get('m4-hp'),    a4_ig    : get('m4-ig'),
        a5_nama  : get('m5-nama'),  a5_email : get('m5-email'),
        a5_hp    : get('m5-hp'),    a5_ig    : get('m5-ig'),
      };

      // Bukti bayar ke base64
      const fileInput = document.getElementById('bukti-bayar');
      const file = fileInput?.files[0];
      if (file) {
        const base64 = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload  = () => res(reader.result.split(',')[1]);
          reader.onerror = () => rej(new Error('Gagal membaca file'));
          reader.readAsDataURL(file);
        });
        formData.buktiBayar = { base64, mimeType: file.type, fileName: file.name };
      }

      // Kirim ke Apps Script via fetch no-cors
      const url = typeof APPS_SCRIPT_URL !== 'undefined' ? APPS_SCRIPT_URL : '';
      if (url) {
        const payload = new FormData();
        payload.append('data', JSON.stringify(formData));
        fetch(url, { method: 'POST', mode: 'no-cors', body: payload })
          .catch(err => console.warn('Fetch error (diabaikan):', err));
      }

      // Tampilkan success screen
      document.getElementById('success-code').textContent = kode;
      document.getElementById('suc-team').textContent     = formData.namaTim;
      document.getElementById('suc-cat').textContent      = katLabel;
      document.getElementById('suc-inst').textContent     = formData.institusi;
      document.getElementById('suc-email').textContent    = formData.a1_email;

      document.querySelectorAll('.reg-panel').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
      });
      document.getElementById('reg-steps').style.display = 'none';
      regFooter.style.display = 'none';
      document.getElementById('reg-success').classList.add('active');
      const regBody = modal.querySelector('.reg-body') || modal;
      regBody.scrollTop = 0;

    } catch (err) {
      console.error('Gagal kirim:', err);
      alert('Gagal mengirim pendaftaran. Pastikan koneksi aktif dan coba lagi.\n\nDetail: ' + err.message);
      btnSubmit.classList.remove('loading');
      btnSubmit.disabled = false;
      btnBack.disabled   = false;
    }
  });

  // ============================================================
  // RESET MODAL
  // ============================================================
  function resetModal() {
    currentStep = 1;
    document.querySelectorAll('.reg-panel').forEach(p => { p.style.display = ''; p.classList.remove('active'); });
    document.getElementById('panel-1').classList.add('active');
    document.getElementById('reg-steps').style.display = '';
    regFooter.style.display = '';
    document.getElementById('reg-success').classList.remove('active');
    document.querySelectorAll('.reg-modal input, .reg-modal textarea, .reg-modal select').forEach(el => {
      if (el.type === 'radio' || el.type === 'checkbox') el.checked = false;
      else if (el.type === 'file') el.value = '';
      else el.value = '';
    });
    document.querySelectorAll('.cat-select-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.form-error').forEach(e => e.classList.remove('visible'));
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(i => {
      i.classList.remove('error', 'valid');
    });
    document.getElementById('agree-wrap').style.borderColor = '';
    const helper = document.querySelector('#bukti-bayar ~ .form-helper, #bukti-bayar + .form-helper');
    if (helper) { helper.textContent = 'Format: JPG, PNG, atau PDF. Maksimal 2MB.'; helper.style.color = ''; }
    btnSubmit.classList.remove('loading');
    btnSubmit.disabled = false;
    btnBack.disabled   = false;
    updateStepUI();
  }

  // Tombol sukses kembali ke beranda
  document.getElementById('btn-success-close').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // ============================================================
  // AUTO-SELECT KATEGORI DARI URL PARAM
  // ============================================================
  const urlParams = new URLSearchParams(window.location.search);
  const katParam  = urlParams.get('kategori');
  if (katParam === 'internal' || katParam === 'external') {
    const targetRadio = document.getElementById(`radio-${katParam}`);
    if (targetRadio) targetRadio.click();
  }

  // ============================================================
  // INIT
  // ============================================================
  initInputSetup();
  updateStepUI();
})();