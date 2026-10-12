const tracks = [
  {title:'MeowZone Main',file:'MeowZone Main.mp3',cover:'Updated MeowZone Main.png',group:'Esenciales'},
  {title:'Origins',file:'MeowZone Origins.mp3',cover:'MeowZone Origins.png',group:'Esenciales'},
  {title:'Respawn',file:'MeowZone Respawn.mp3',cover:'MeowZone - Respawn.png',group:'Esenciales'},
  {title:'Good Human',file:'MeowZone Good Human.mp3',cover:'MeowZone Good Human.png',group:'Esenciales'},
  {title:'Birthday Queen',file:'MeowZone Birthday Queen.mp3',cover:'MeowZone Birthday Queen.png',group:'Esenciales'},
  {title:'Time Jump',file:'MeowZone Time Jump.mp3',cover:'TimeJump! MeoZone.png',group:'Aventuras'},
  {title:'Paws Up Tomorrow',file:'MeowZone - Paws Up Tomorrow.mp3',cover:'MeowZone Paws Up Tomorrow.png',group:'Aventuras'},
  {title:'Global Cat-astrophe',file:'MEOWZONE - Global Cat-astrophe.mp3',cover:'MeowZone - Global Cat-astrophe.png',group:'Aventuras'},
  {title:'Catnip Heist',file:'Catnip Heist.mp3',cover:'MeowZone Catnip Heist.png',group:'Aventuras'},
  {title:'Crimson Menace',file:'Crimson Menace.mp3',cover:'MeowZone Crimson Menace.png',group:'Aventuras'},
  {title:'Dust Dragon',file:'Dust Dragon.mp3',cover:'MeowZone - Dust Dragon.png',group:'Aventuras'},
  {title:'Infinity Box',file:'Infinity Box.mp3',cover:'MeowZone - Infinity Box.png',group:'Aventuras'},
  {title:'Cats.exe V2',file:'MeowZone - Cats.exe V2.mp3',cover:'Cats.exe V2.png',group:'Aventuras'},
  {title:'Cats.exe',file:'Cats-exe.mp3',cover:'MeowZone Cats exe.png',group:'Aventuras'},
  {title:'LOAF',file:'MeowZone - LOAF.mp3',cover:'MeowZone LOAF.png',group:'Modo gato'},
  {title:'Zoomies Protocol',file:'Zoomies Protocol.mp3',cover:'MeowZone Zoomies.png',group:'Modo gato'},
  {title:'Personal Space',file:'Personal Space.mp3',cover:'MeowZone Personal Space.png',group:'Modo gato'},
  {title:'Rainbow Cats',file:'Rainbow Cats.mp3',cover:'Rainbow Cats.png',group:'Modo gato'},
  {title:'Unsupervised Cats',file:'Unsupervised Cats.mp3',cover:'Unsupervised cats.png',group:'Modo gato'},
  {title:'Fursuit Mode',file:'Fursuit Mode.mp3',cover:'Fursuit Mode.png',group:'Modo gato'},
  {title:'Feline Instinct',file:'Feline Instinct.mp3',cover:'MeowZone - Feline Instinct.jpg',group:'Modo gato'},
  {title:'Door Is Closed',file:'Door is closed.mp3',cover:'MeowZone - Door is Closed.png',group:'Modo gato'}
];
const coverPath = name => 'Art/Covers/' + encodeURIComponent(name);
const songPath = name => 'Songs/' + encodeURIComponent(name);
const player = document.querySelector('.audio-player');
const audio = player?.querySelector('audio');
const listeningDialog = document.createElement('dialog');
listeningDialog.className = 'listening-dialog';
listeningDialog.setAttribute('aria-label', 'Portada y letra de la canción');
listeningDialog.innerHTML = `<div class="listening-top"><span>MEOWZONE / AHORA SUENA</span><button type="button" class="listening-close" aria-label="Cerrar portada y letra">×</button></div><div class="listening-grid"><div class="listening-art"><img alt=""><div class="modal-player"><button type="button" class="modal-play" aria-label="Pausar canción">❚❚</button><span class="modal-current">00:00</span><input class="modal-seek" type="range" min="0" max="100" value="0" aria-label="Progreso de la canción"><span class="modal-duration">00:00</span></div><p>THREE CATS ✦ NINE LIVES ✦ ONE DESTINY</p></div><div class="listening-copy"><span class="eyebrow">Portada y letra</span><h2></h2><p class="lyrics-source"></p><div class="karaoke" aria-label="Letra siguiendo la reproducción"><span class="karaoke-section"></span><p class="karaoke-prev"></p><p class="karaoke-current" aria-live="off"></p><p class="karaoke-next"></p><div class="karaoke-progress"><span></span></div><div class="karaoke-controls"><button type="button" class="lyrics-earlier" aria-label="Adelantar letra dos segundos">−2 s</button><span class="lyrics-offset">Ajusta el desfase si hace falta</span><button type="button" class="lyrics-later" aria-label="Retrasar letra dos segundos">+2 s</button></div></div><details class="full-lyrics"><summary>Ver letra completa</summary><div class="lyrics-text"></div></details><div class="lyric-report"><button type="button" class="lyric-report-toggle" aria-expanded="false">⚑ Reportar un problema con la letra</button><form class="lyric-report-form" hidden><p class="lyric-report-help">Enviaremos tu aviso al creador con la canción y el minuto. No necesitas indicar tu correo.</p><p class="lyric-report-context"></p><label>¿Qué falla?<select name="tipo"><option value="Letra incorrecta">La letra es incorrecta</option><option value="Desfase">La letra va adelantada o atrasada</option><option value="Letra ausente">Falta la letra</option><option value="Otro">Otro problema</option></select></label><label>¿Qué deberíamos corregir?<textarea name="detalle" rows="3" maxlength="1000" placeholder="Explica el fallo para que podamos encontrarlo" required></textarea></label><label class="lyric-report-honeypot" aria-hidden="true">No rellenar<input name="botcheck" tabindex="-1" autocomplete="off"></label><button type="submit" class="lyric-report-send">Enviar aviso</button><p class="lyric-report-status" role="status" aria-live="polite"></p><small>El informe se envía mediante Web3Forms.</small></form></div></div></div>`;
document.body.append(listeningDialog);
listeningDialog.querySelector('.listening-close').addEventListener('click', () => listeningDialog.close());
listeningDialog.addEventListener('click', event => { if (event.target === listeningDialog) listeningDialog.close(); });
let activeTrack = null;
let timedLyrics = [];
let lyricOffset = 0;
let reportSnapshot = null;
const lyricsReportAccessKey = '40be3733-47e6-4217-b3d5-eec9676156e9';
const lyricsReportForm = listeningDialog.querySelector('.lyric-report-form');
const lyricsReportToggle = listeningDialog.querySelector('.lyric-report-toggle');
function reportTime(seconds) {
  const safe = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}
const modalPlay = listeningDialog.querySelector('.modal-play');
const modalSeek = listeningDialog.querySelector('.modal-seek');
function syncModalPlayer() {
  if (!audio) return;
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  listeningDialog.querySelector('.modal-current').textContent = reportTime(audio.currentTime);
  listeningDialog.querySelector('.modal-duration').textContent = reportTime(duration);
  modalSeek.max = String(duration || 100);
  if (!modalSeek.matches(':active')) modalSeek.value = String(audio.currentTime || 0);
  modalPlay.textContent = audio.paused ? '▶' : '❚❚';
  modalPlay.setAttribute('aria-label', audio.paused ? 'Reproducir canción' : 'Pausar canción');
}
modalPlay.addEventListener('click', () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); });
modalSeek.addEventListener('input', () => {
  if (!audio || !Number.isFinite(audio.duration)) return;
  audio.currentTime = Number(modalSeek.value);
  syncModalPlayer();
});
['timeupdate','loadedmetadata','durationchange','play','pause','ended'].forEach(name => audio?.addEventListener(name, syncModalPlayer));
function captureLyricReport() {
  return {
    title: activeTrack.title,
    file: activeTrack.file,
    time: reportTime(audio.currentTime),
    line: listeningDialog.querySelector('.karaoke-current').textContent.trim(),
    offset: lyricOffset
  };
}
lyricsReportToggle.addEventListener('click', () => {
  if (!activeTrack) return;
  const open = lyricsReportForm.hidden;
  lyricsReportForm.hidden = !open;
  lyricsReportToggle.setAttribute('aria-expanded', String(open));
  if (!open) return;
  reportSnapshot = captureLyricReport();
  lyricsReportForm.querySelector('.lyric-report-context').textContent = `${reportSnapshot.title} · ${reportSnapshot.time}`;
  lyricsReportForm.querySelector('.lyric-report-status').textContent = '';
  lyricsReportForm.querySelector('textarea').focus();
});
lyricsReportForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!activeTrack || !reportSnapshot) return;
  const sendButton = lyricsReportForm.querySelector('.lyric-report-send');
  const status = lyricsReportForm.querySelector('.lyric-report-status');
  sendButton.disabled = true;
  status.textContent = 'Enviando aviso…';
  try {
    const fields = new FormData(lyricsReportForm);
    fields.append('access_key', lyricsReportAccessKey);
    fields.append('subject', `MeowZone · problema de letra: ${reportSnapshot.title}`);
    fields.append('from_name', 'MeowZone web');
    fields.append('cancion', reportSnapshot.title);
    fields.append('archivo', reportSnapshot.file);
    fields.append('momento', reportSnapshot.time);
    fields.append('linea_visible', reportSnapshot.line);
    fields.append('desfase_segundos', String(reportSnapshot.offset));
    fields.append('pagina', location.hostname === 'zorentradico.github.io' ? location.origin + location.pathname : 'Copia local');
    const response = await fetch('https://api.web3forms.com/submit', {method: 'POST', body: fields});
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error(result.message || 'Error al enviar');
    status.textContent = 'Aviso enviado. ¡Gracias por ayudar a mejorar la letra!';
    lyricsReportForm.reset();
  } catch (_) {
    status.textContent = 'No se pudo enviar el aviso. Comprueba la conexión e inténtalo de nuevo.';
  } finally {
    sendButton.disabled = false;
  }
});
function lyricLines(raw) {
  let section = '';
  let gap = 0;
  return raw.split(/\r?\n/).flatMap(part => {
    const line = part.trim();
    if (!line) { gap += 0.8; return []; }
    if (/^\[[^\]]+\]$/.test(line)) { section = line.slice(1, -1); gap += 1.2; return []; }
    const weight = Math.max(1.8, line.split(/\s+/).length * 0.58 + line.length * 0.025) + gap;
    gap = 0;
    return [{ text: line, section, weight }];
  });
}
function rebuildTimedLyrics() {
  if (!activeTrack) return;
  const channelTimes = window.timedTrackLyrics?.[activeTrack.file];
  if (channelTimes?.length) {
    timedLyrics = channelTimes;
    const source = listeningDialog.querySelector('.lyrics-source');
    source.hidden = activeTrack.file !== 'Dust Dragon.mp3';
    if (!source.hidden) source.innerHTML = 'Letra original de <a href="https://suno.com/s/7ckXGaPiB53JmpCd" target="_blank" rel="noopener noreferrer">Suno ↗</a> · tiempos revisados por secciones; puedes ajustar el desfase.';
    updateKaraoke();
    return;
  }
  listeningDialog.querySelector('.lyrics-source').hidden = false;
  listeningDialog.querySelector('.lyrics-source').textContent = 'Seguimiento estimado · Esta canción no tiene subtítulos con tiempos.';
  const lines = lyricLines(window.trackLyrics?.[activeTrack.file] || 'Letra no disponible.');
  const duration = Number.isFinite(audio.duration) ? audio.duration : 210;
  const first = 1.5;
  const usable = Math.max(1, duration - first - 1);
  const sum = lines.reduce((total, line) => total + line.weight, 0) || 1;
  let position = first;
  timedLyrics = lines.map(line => {
    const item = { ...line, start: position };
    position += line.weight / sum * usable;
    return item;
  });
  updateKaraoke();
}
function updateKaraoke() {
  if (!activeTrack || !timedLyrics.length) return;
  const time = Math.max(0, audio.currentTime - lyricOffset);
  let index = timedLyrics.findLastIndex(line => time >= line.start);
  if (index < 0) index = 0;
  const current = timedLyrics[index];
  listeningDialog.querySelector('.karaoke-section').textContent = current.section;
  listeningDialog.querySelector('.karaoke-prev').textContent = timedLyrics[index - 1]?.text || '';
  listeningDialog.querySelector('.karaoke-current').textContent = current.text;
  listeningDialog.querySelector('.karaoke-current').classList.toggle('long', current.text.length > 90);
  listeningDialog.querySelector('.karaoke-next').textContent = timedLyrics[index + 1]?.text || '';
  const end = timedLyrics[index + 1]?.start || audio.duration || current.start + 5;
  const percent = Math.max(0, Math.min(100, (time - current.start) / Math.max(.1, end - current.start) * 100));
  listeningDialog.querySelector('.karaoke-progress span').style.width = percent + '%';
  listeningDialog.querySelector('.lyrics-offset').textContent = lyricOffset === 0 ? 'Ajusta el desfase si hace falta' : `Desfase ${lyricOffset > 0 ? '+' : ''}${lyricOffset} s`;
}
function adjustLyricOffset(delta) {
  if (!activeTrack) return;
  lyricOffset = Math.max(-30, Math.min(30, lyricOffset + delta));
  try { localStorage.setItem('meowzone-lyrics-' + activeTrack.file, String(lyricOffset)); } catch (_) {}
  updateKaraoke();
}
listeningDialog.querySelector('.lyrics-earlier').addEventListener('click', () => adjustLyricOffset(-2));
listeningDialog.querySelector('.lyrics-later').addEventListener('click', () => adjustLyricOffset(2));
audio?.addEventListener('loadedmetadata', rebuildTimedLyrics);
audio?.addEventListener('durationchange', rebuildTimedLyrics);
audio?.addEventListener('timeupdate', updateKaraoke);
audio?.addEventListener('seeked', updateKaraoke);
function showListeningDialog() {
  if (!listeningDialog.open) listeningDialog.showModal();
}
if (player) {
  const expand = document.createElement('button');
  expand.type = 'button';
  expand.className = 'player-expand';
  expand.textContent = 'Portada y letra ↗';
  expand.addEventListener('click', showListeningDialog);
  player.insertBefore(expand, player.querySelector('.player-close'));
}
function playTrack(index, reveal = true) {
  if (!player || !audio || !tracks[index]) return;
  const track = tracks[index];
  activeTrack = track;
  try { lyricOffset = Number(localStorage.getItem('meowzone-lyrics-' + track.file)) || 0; } catch (_) { lyricOffset = 0; }
  audio.src = songPath(track.file);
  player.querySelector('img').src = coverPath(track.cover);
  player.querySelector('img').alt = 'Portada de ' + track.title;
  player.querySelector('strong').textContent = track.title;
  player.classList.add('active');
  document.body.classList.add('with-player');
  listeningDialog.querySelector('.listening-art img').src = coverPath(track.cover);
  listeningDialog.querySelector('.listening-art img').alt = 'Portada de ' + track.title;
  listeningDialog.querySelector('h2').textContent = track.title;
  listeningDialog.querySelector('.lyrics-text').textContent = window.trackLyrics?.[track.file] || 'Letra no disponible.';
  listeningDialog.querySelector('.full-lyrics').open = false;
  lyricsReportForm.hidden = true;
  lyricsReportToggle.setAttribute('aria-expanded', 'false');
  lyricsReportForm.reset();
  reportSnapshot = null;
  rebuildTimedLyrics();
  if (reveal) showListeningDialog();
  audio.play().catch(() => {});
  syncModalPlayer();
}
document.querySelectorAll('[data-track]').forEach(button => button.addEventListener('click', () => playTrack(Number(button.dataset.track))));
player?.querySelector('.player-close')?.addEventListener('click', () => {audio.pause();audio.removeAttribute('src');audio.load();player.classList.remove('active');document.body.classList.remove('with-player');listeningDialog.close()});
if (audio) audio.addEventListener('ended', () => { const index = tracks.findIndex(t => audio.src.endsWith(encodeURIComponent(t.file))); if (index >= 0 && index < tracks.length - 1) playTrack(index + 1, false); });

const songList = document.querySelector('#song-list');
if (songList) {
  function renderSongs(group = 'Todas') {
    songList.replaceChildren();
    tracks.forEach((track, index) => {
      if (group !== 'Todas' && track.group !== group) return;
      const row = document.createElement('article'); row.className = 'song-row';
      row.innerHTML = `<span class="number">${String(index+1).padStart(2,'0')}</span><img loading="lazy" src="${coverPath(track.cover)}" alt=""><div><h3>${track.title}</h3><p>${track.group} · MeowZone</p></div><button type="button" aria-label="Reproducir ${track.title}">▶</button>`;
      row.querySelector('button').addEventListener('click', () => playTrack(index));
      songList.append(row);
    });
  }
  renderSongs();
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderSongs(button.dataset.filter);
  }));
}
const toggle = document.querySelector('.menu-toggle');
toggle?.addEventListener('click', () => {const nav=document.querySelector('.site-nav'); const open=nav.classList.toggle('open'); toggle.setAttribute('aria-expanded',String(open));});

// Reportes generales visibles en todas las páginas, sin pedir datos personales.
const issueButton = document.createElement('button');
issueButton.type = 'button';
issueButton.className = 'issue-button';
issueButton.textContent = '⚑ Informar de un fallo';
issueButton.setAttribute('aria-label', 'Informar de un fallo en MeowZone');
const issueDialog = document.createElement('dialog');
issueDialog.className = 'issue-dialog';
issueDialog.setAttribute('aria-label', 'Informar de un fallo');
issueDialog.innerHTML = `<div class="listening-top"><span>MEOWZONE / INCIDENCIAS</span><button type="button" class="issue-close" aria-label="Cerrar formulario">×</button></div><form class="issue-form"><h2>¿Has visto algún fallo?</h2><p>Cuéntanos qué ocurre y dónde. Incluiremos automáticamente la página, el tipo de dispositivo y el navegador para facilitar la revisión. No necesitamos tu correo.</p><label>Tipo de problema<select name="tipo" required><option value="Visual">Diseño o imagen</option><option value="Reproductor">Reproductor</option><option value="Letra">Letra</option><option value="Enlace">Enlace</option><option value="Otro">Otro</option></select></label><label>¿Qué ha pasado?<textarea name="detalle" maxlength="1200" rows="5" placeholder="Describe el fallo y cómo se puede repetir" required></textarea></label><label class="lyric-report-honeypot" aria-hidden="true">No rellenar<input name="botcheck" tabindex="-1" autocomplete="off"></label><button type="submit" class="lyric-report-send">Enviar aviso</button><p class="issue-status" role="status" aria-live="polite"></p><small>El informe se envía mediante Web3Forms.</small></form>`;
document.body.append(issueButton, issueDialog);
issueButton.addEventListener('click', () => issueDialog.showModal());
issueDialog.querySelector('.issue-close').addEventListener('click', () => issueDialog.close());
issueDialog.addEventListener('click', event => { if (event.target === issueDialog) issueDialog.close(); });
function visitorContext() {
  const ua = navigator.userAgent;
  let platform = navigator.userAgentData?.platform || (/(iPhone|iPad|iPod)/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Macintosh/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Otro');
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Otro';
  return {platform, browser, format: matchMedia('(max-width: 700px)').matches ? 'Móvil / pantalla estrecha' : 'Escritorio / pantalla ancha'};
}
issueDialog.querySelector('form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const send = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.issue-status');
  send.disabled = true;
  status.textContent = 'Enviando aviso…';
  try {
    const context = visitorContext();
    const fields = new FormData(form);
    fields.append('access_key', lyricsReportAccessKey);
    fields.append('subject', `MeowZone · incidencia: ${fields.get('tipo')}`);
    fields.append('from_name', 'MeowZone web');
    fields.append('pagina', location.hostname === 'zorentradico.github.io' ? location.origin + location.pathname : 'Copia local');
    fields.append('plataforma', context.platform);
    fields.append('navegador', context.browser);
    fields.append('formato', context.format);
    const response = await fetch('https://api.web3forms.com/submit', {method:'POST', body:fields});
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error(result.message || 'Error al enviar');
    status.textContent = 'Aviso enviado. ¡Gracias!';
    form.reset();
  } catch (_) {
    status.textContent = 'No se pudo enviar. Comprueba la conexión e inténtalo de nuevo.';
  } finally {
    send.disabled = false;
  }
});
