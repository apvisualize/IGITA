// ============================================================
  // REGISTRATION MODAL SYSTEM
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

    document.getElementById('btn-success-close').addEventListener('click', () => {
        window.location.href = 'index.html';
    });


    // ---- Category card selection ----
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

    // ---- Char counter for description ----
    const desc = document.getElementById('deskripsi-proyek');
    const counter = document.getElementById('char-counter');
    if (desc && counter) {
      desc.addEventListener('input', () => {
        counter.textContent = desc.value.length + ' / 300 karakter';
      });
    }

    // ---- Validation helpers ----
    function showErr(id, show) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('visible', show);
    }
    function setInputErr(id, hasErr) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('error', hasErr);
    }
    function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function isPhone(v) { return v.replace(/[\s\-]/g, '').length >= 9; }

    function validateStep1() {
      let ok = true;
      const kat = document.querySelector('input[name="kategori"]:checked');
      const noKat = !kat;
      showErr('err-kategori', noKat);
      if (noKat) ok = false;

      const namaVal = document.getElementById('nama-tim').value.trim();
      const noNama = namaVal.length < 2;
      setInputErr('nama-tim', noNama); showErr('err-nama-tim', noNama);
      if (noNama) ok = false;

      if (kat && kat.value === 'external') {
        const instVal = document.getElementById('asal-institusi').value.trim();
        const noInst = instVal.length < 2;
        setInputErr('asal-institusi', noInst); showErr('err-asal-institusi', noInst);
        if (noInst) ok = false;
      } else {
        setInputErr('asal-institusi', false); showErr('err-asal-institusi', false);
      }

      return ok;
    }

    function validateStep2() {
      let ok = true;
      const members = [
        { id: 1, req: true },
        { id: 2, req: true },
        { id: 3, req: true },
        { id: 4, req: true },
        { id: 5, req: false }
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

        if (!m.req && !namVal && !emVal && !hpVal && !igVal) {
          setInputErr(namId, false); showErr(`err-${namId}`, false);
          setInputErr(emId,  false); showErr(`err-${emId}`,  false);
          setInputErr(hpId,  false); showErr(`err-${hpId}`,  false);
          setInputErr(igId,  false); showErr(`err-${igId}`,  false);
          return;
        }

        const noNam = namVal.length < 2;
        setInputErr(namId, noNam); showErr(`err-${namId}`, noNam);
        if (noNam) ok = false;

        const noEm = !isEmail(emVal);
        setInputErr(emId, noEm); showErr(`err-${emId}`, noEm);
        if (noEm) ok = false;

        const noHp = !isPhone(hpVal);
        setInputErr(hpId, noHp); showErr(`err-${hpId}`, noHp);
        if (noHp) ok = false;

        const noIg = igVal.length < 2;
        setInputErr(igId, noIg); showErr(`err-${igId}`, noIg);
        if (noIg) ok = false;
      });
      return ok;
    }

    function validateStep3() {
      let ok = true;
      const fileInput = document.getElementById('bukti-bayar');
      const noFile = !fileInput || !fileInput.files || fileInput.files.length === 0;
      setInputErr('bukti-bayar', noFile); showErr('err-bukti-bayar', noFile);
      if (noFile) ok = false;

      const agreed = document.getElementById('agree-check').checked;
      showErr('err-agree', !agreed);
      document.getElementById('agree-wrap').style.borderColor = agreed ? '' : 'rgba(255,80,80,0.4)';
      if (!agreed) ok = false;

      return ok;
    }

    // ---- Step navigation ----
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
      btnNext.style.display = isLast ? 'none' : 'inline-flex';
      btnSubmit.classList.toggle('visible', isLast);

      stepText.textContent = 'Langkah ' + currentStep + ' dari ' + TOTAL_STEPS;
      modal.scrollTop = 0;
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
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
      }
    });

    // ---- Generate registration code ----
    function generateCode() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = 'IGITA-2026-';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return code;
    }

    // ---- Submit: kirim ke Google Sheets via hidden form ----
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
          // Anggota 1 (Ketua)
          a1_nama  : get('m1-nama'),  a1_email : get('m1-email'),
          a1_hp    : get('m1-hp'),    a1_ig    : get('m1-ig'),
          // Anggota 2
          a2_nama  : get('m2-nama'),  a2_email : get('m2-email'),
          a2_hp    : get('m2-hp'),    a2_ig    : get('m2-ig'),
          // Anggota 3
          a3_nama  : get('m3-nama'),  a3_email : get('m3-email'),
          a3_hp    : get('m3-hp'),    a3_ig    : get('m3-ig'),
          // Anggota 4
          a4_nama  : get('m4-nama'),  a4_email : get('m4-email'),
          a4_hp    : get('m4-hp'),    a4_ig    : get('m4-ig'),
          // Anggota 5 (Cadangan - opsional)
          a5_nama  : get('m5-nama'),  a5_email : get('m5-email'),
          a5_hp    : get('m5-hp'),    a5_ig    : get('m5-ig'),
        };

        // Konversi bukti bayar ke base64
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

        // Kirim ke Google Apps Script via fetch no-cors
        // (no-cors = tidak bisa baca response, tapi data tetap terkirim)
        const url = typeof APPS_SCRIPT_URL !== 'undefined' ? APPS_SCRIPT_URL : '';
        if (url) {
          const payload = new FormData();
          payload.append('data', JSON.stringify(formData));
          fetch(url, {
            method : 'POST',
            mode   : 'no-cors',
            body   : payload
          }).catch(err => console.warn('Fetch error (diabaikan):', err));
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
        modal.scrollTop = 0;

      } catch (err) {
        console.error('Gagal kirim:', err);
        alert('Gagal mengirim pendaftaran. Pastikan koneksi aktif dan coba lagi.\n\nDetail: ' + err.message);
        btnSubmit.classList.remove('loading');
        btnSubmit.disabled = false;
        btnBack.disabled   = false;
      }
    });

    // ---- Reset modal ----
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
      document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(i => i.classList.remove('error'));
      document.getElementById('agree-wrap').style.borderColor = '';
      btnSubmit.classList.remove('loading'); btnSubmit.disabled = false; btnBack.disabled = false;
      updateStepUI();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const katParam = urlParams.get('kategori'); // akan bernilai 'internal' atau 'external'

    if (katParam === 'internal' || katParam === 'external') {
      // Cari elemen radio input yang sesuai berdasarkan ID di daftar.html
      const targetRadio = document.getElementById(`radio-${katParam}`);
      if (targetRadio) {
        // Simulasikan klik pada radio tersebut agar fungsi rombak UI otomatis berjalan
        targetRadio.click();
      }
    }

    updateStepUI();
  })();