/* MeowZone: biblioteca, páginas de canciones y nuevas secciones. */
const meowSlug = title => title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const meowSongUrl = track => 'cancion-' + meowSlug(track.title) + '.html';
const meowRead = key => { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch (_) { return []; } };
const meowSave = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
let meowFavorites = meowRead('meowzone-favorites-v1').filter(file => tracks.some(t => t.file === file));
let meowQueue = meowRead('meowzone-queue-v1').filter(file => tracks.some(t => t.file === file));
let meowFavoriteFilter = false;
const meowIndex = file => tracks.findIndex(t => t.file === file);
const meowEscape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function meowToggleFavorite(index) {
  const file = tracks[index]?.file;
  if (!file) return;
  meowFavorites = meowFavorites.includes(file) ? meowFavorites.filter(item => item !== file) : [...meowFavorites, file];
  meowSave('meowzone-favorites-v1', meowFavorites);
  meowUpdateLibrary();
}
function meowAddQueue(index) {
  const file = tracks[index]?.file;
  if (!file) return;
  meowQueue.push(file);
  meowSave('meowzone-queue-v1', meowQueue);
  meowUpdateLibrary();
  meowQueueDialog.showModal();
}
const meowQueueDialog = document.createElement('dialog');
meowQueueDialog.className = 'library-dialog';
meowQueueDialog.innerHTML = '<div class="listening-top"><span>MEOWZONE / TU BIBLIOTECA</span><button type="button" class="library-close" aria-label="Cerrar">×</button></div><div class="library-content"><h2>Tu cola de reproducción</h2><p>Se guarda solo en este navegador. Al terminar una canción, sonará la siguiente de la cola.</p><ol class="library-queue"></ol><button type="button" class="library-clear ghost-button">Vaciar cola</button><h2>Tus favoritas</h2><div class="library-favorites"></div></div>';
document.body.append(meowQueueDialog);
meowQueueDialog.querySelector('.library-close').addEventListener('click', () => meowQueueDialog.close());
meowQueueDialog.addEventListener('click', event => { if (event.target === meowQueueDialog) meowQueueDialog.close(); });
meowQueueDialog.querySelector('.library-clear').addEventListener('click', () => { meowQueue = []; meowSave('meowzone-queue-v1',meowQueue); meowUpdateLibrary(); });
meowQueueDialog.addEventListener('click', event => {
  const remove = event.target.closest('[data-queue-remove]');
  if (remove) { meowQueue.splice(Number(remove.dataset.queueRemove),1); meowSave('meowzone-queue-v1',meowQueue); meowUpdateLibrary(); return; }
  const play = event.target.closest('[data-library-play]');
  if (play) { playTrack(Number(play.dataset.libraryPlay),false); meowQueueDialog.close(); }
});
const meowQueueButton = document.createElement('button');
meowQueueButton.type = 'button';
meowQueueButton.className = 'library-button';
meowQueueButton.addEventListener('click', () => meowQueueDialog.showModal());
player?.insertBefore(meowQueueButton, player.querySelector('.player-close'));
function meowUpdateLibrary() {
  meowQueueButton.textContent = 'Cola · ' + meowQueue.length;
  const queueList = meowQueueDialog.querySelector('.library-queue');
  queueList.innerHTML = meowQueue.length ? meowQueue.map((file, position) => {
    const i = meowIndex(file); const t = tracks[i];
    return '<li><img src="'+coverPath(t.cover)+'" alt=""><strong>'+meowEscape(t.title)+'</strong><button type="button" data-library-play="'+i+'" aria-label="Reproducir '+meowEscape(t.title)+'">▶</button><button type="button" data-queue-remove="'+position+'" aria-label="Quitar '+meowEscape(t.title)+'">×</button></li>';
  }).join('') : '<li class="library-empty">Todavía no hay canciones en cola.</li>';
  const favorites = meowQueueDialog.querySelector('.library-favorites');
  favorites.innerHTML = meowFavorites.length ? meowFavorites.map(file => {
    const i = meowIndex(file); const t = tracks[i];
    return '<a href="'+meowSongUrl(t)+'">'+meowEscape(t.title)+'</a>';
  }).join('') : '<p>Aún no has guardado favoritas.</p>';
  document.querySelectorAll('[data-favorite]').forEach(button => {
    const chosen = meowFavorites.includes(tracks[Number(button.dataset.favorite)]?.file);
    button.textContent = chosen ? '♥' : '♡';
    button.setAttribute('aria-pressed',String(chosen));
    button.setAttribute('aria-label',(chosen ? 'Quitar de favoritas: ' : 'Guardar en favoritas: ') + tracks[Number(button.dataset.favorite)]?.title);
  });
  document.querySelectorAll('[data-queue-add]').forEach(button => button.title = 'Añadir a la cola');
  if (meowFavoriteFilter) meowApplyFavoriteFilter();
}
window.meowzoneNextTrack = () => {
  if (!meowQueue.length) return false;
  const file = meowQueue.shift();
  meowSave('meowzone-queue-v1',meowQueue);
  meowUpdateLibrary();
  const i = meowIndex(file);
  if (i < 0) return false;
  playTrack(i,false);
  return true;
};
document.addEventListener('click', event => {
  const favorite = event.target.closest('[data-favorite]');
  if (favorite) { meowToggleFavorite(Number(favorite.dataset.favorite)); return; }
  const queue = event.target.closest('[data-queue-add]');
  if (queue) meowAddQueue(Number(queue.dataset.queueAdd));
});
function meowDecorateRows() {
  document.querySelectorAll('#song-list .song-row:not([data-decorated])').forEach(row => {
    const title = row.querySelector('h3')?.textContent;
    const i = tracks.findIndex(t => t.title === title);
    if (i < 0) return;
    row.dataset.decorated = 'true';
    row.dataset.songFile = tracks[i].file;
    const info = row.querySelector('div');
    const link = document.createElement('a');
    link.href = meowSongUrl(tracks[i]); link.className = 'song-detail-link'; link.textContent = 'Portada y letra →';
    info.append(link);
    const controls = document.createElement('div'); controls.className = 'song-extra-actions';
    controls.innerHTML = '<button type="button" data-favorite="'+i+'"></button><button type="button" data-queue-add="'+i+'" aria-label="Añadir '+meowEscape(title)+' a la cola">＋</button>';
    row.append(controls);
  });
  meowUpdateLibrary();
}
function meowApplyFavoriteFilter() {
  document.querySelectorAll('#song-list .song-row').forEach(row => { row.hidden = !meowFavorites.includes(row.dataset.songFile); });
  const empty = document.querySelector('.favorites-empty');
  if (empty) empty.hidden = meowFavorites.length > 0;
}
if (songList) {
  const observer = new MutationObserver(() => { observer.disconnect(); meowDecorateRows(); observer.observe(songList,{childList:true}); });
  observer.observe(songList,{childList:true});
  meowDecorateRows();
  const filterBar = document.querySelector('.filter-bar');
  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button'; favoriteButton.textContent = '♥ Favoritas'; favoriteButton.setAttribute('aria-pressed','false');
  filterBar.append(favoriteButton);
  const empty = document.createElement('p'); empty.className = 'favorites-empty'; empty.hidden = true;
  empty.textContent = 'Todavía no has marcado canciones favoritas. Pulsa ♡ junto a una pista para guardarla aquí.';
  songList.after(empty);
  favoriteButton.addEventListener('click', () => {
    document.querySelector('[data-filter="Todas"]').click();
    meowFavoriteFilter = true;
    document.querySelectorAll('.filter-bar button').forEach(button => button.setAttribute('aria-pressed',String(button === favoriteButton)));
    meowApplyFavoriteFilter();
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    meowFavoriteFilter = false;
    favoriteButton.setAttribute('aria-pressed','false');
    document.querySelectorAll('#song-list .song-row').forEach(row => { row.hidden = false; });
    empty.hidden = true;
  }));
}
const songPage = document.querySelector('[data-song-index]');
if (songPage) {
  const i = Number(songPage.dataset.songIndex);
  const track = tracks[i];
  const timed = window.timedTrackLyrics?.[track.file] || [];
  const list = songPage.querySelector('.song-timed-lines');
  document.querySelector('.song-full-lyrics').textContent = window.trackLyrics?.[track.file] || 'Letra no disponible.';
  if (timed.length) {
    timed.forEach((line, position) => {
      const item = document.createElement('li');
      item.textContent = line.text;
      item.dataset.position = position;
      item.tabIndex = 0;
      item.title = 'Ir a ' + reportTime(line.start);
      item.addEventListener('click', () => { if (audio.dataset.meowTrack !== track.file) playTrack(i,false); audio.currentTime = line.start; audio.play().catch(()=>{}); });
      item.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); item.click(); } });
      list.append(item);
    });
  } else list.innerHTML = '<li>La letra sincronizada aún no está disponible para esta canción.</li>';
  const play = songPage.querySelector('.song-page-play');
  play.addEventListener('click', () => { if (audio.dataset.meowTrack === track.file && !audio.paused) audio.pause(); else if (audio.dataset.meowTrack === track.file) audio.play().catch(()=>{}); else playTrack(i,false); });
  songPage.querySelector('.song-page-favorite').dataset.favorite = i;
  songPage.querySelector('.song-page-queue').dataset.queueAdd = i;
  function syncPage() {
    const isCurrent = audio.dataset.meowTrack === track.file;
    play.textContent = isCurrent && !audio.paused ? '❚❚ Pausar' : '▶ Reproducir';
    const index = isCurrent ? Math.max(0,timed.findLastIndex(line => audio.currentTime - lyricOffset >= line.start)) : -1;
    list.querySelectorAll('li').forEach((item,n) => item.classList.toggle('active', n === index));
    if (index >= 0 && index !== Number(list.dataset.active)) {
      list.dataset.active = index;
      list.children[index]?.scrollIntoView({block:'center',behavior:'smooth'});
    }
    songPage.querySelector('.song-current-time').textContent = isCurrent ? reportTime(audio.currentTime) : '00:00';
  }
  ['timeupdate','play','pause','seeked','ended'].forEach(event => audio?.addEventListener(event,syncPage));
  meowUpdateLibrary();
}
const lifeMap = document.querySelector('#life-map');
if (lifeMap) {
  const lives = [
    {name:'La chispa',theme:'Los primeros pasos del trío',songs:[0,1],cats:['Jinu','Taeo','Siwoo']},
    {name:'Volver a empezar',theme:'Caer, regresar y seguir adelante',songs:[2,3],cats:['Jinu','Taeo','Siwoo']},
    {name:'Luces de neón',theme:'Una fiesta y una promesa de futuro',songs:[4,6],cats:['Jinu','Taeo','Siwoo']},
    {name:'Saltos imposibles',theme:'El tiempo y las fronteras se pliegan',songs:[5,7],cats:['Jinu','Taeo','Siwoo']},
    {name:'Misión nocturna',theme:'Sigilo, estrategia y sorpresas',songs:[8,9],cats:['Jinu','Taeo','Siwoo']},
    {name:'El desierto',theme:'Una aventura bajo el sol y el polvo',songs:[10,11],cats:['Jinu','Taeo','Siwoo']},
    {name:'Modo digital',theme:'Los gatos toman la red',songs:[12,13,19],cats:['Jinu','Taeo','Siwoo']},
    {name:'Instinto felino',theme:'Descanso, carreras, alturas y travesuras',songs:[14,15,16,20,21,22,23],cats:['Jinu','Taeo','Siwoo']},
    {name:'Todas las vidas',theme:'El color y el caos siguen abiertos',songs:[17,18],cats:['Jinu','Taeo','Siwoo']}
  ];
  const buttons = lifeMap.querySelector('.life-buttons');
  const panel = lifeMap.querySelector('.life-panel');
  lives.forEach((life,i) => {
    const button = document.createElement('button'); button.type='button'; button.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span>'+life.name; button.addEventListener('click',()=>selectLife(i)); buttons.append(button);
  });
  function selectLife(i) {
    const life = lives[i]; const cover = tracks[life.songs[0]];
    buttons.querySelectorAll('button').forEach((button,n)=>button.setAttribute('aria-pressed',String(n===i)));
    panel.innerHTML = '<img src="'+coverPath(cover.cover)+'" alt="Portada de '+meowEscape(cover.title)+'"><div><span class="eyebrow">Vida '+(i+1)+' de 9</span><h2>'+life.name+'</h2><p>'+life.theme+'.</p><p class="life-cats">Con Jinu, Taeo y Siwoo</p><div class="life-songs">'+life.songs.map(n=>'<a href="'+meowSongUrl(tracks[n])+'">'+meowEscape(tracks[n].title)+' →</a>').join('')+'</div></div>';
  }
  selectLife(0);
}
const gallery = document.querySelector('#art-gallery');
if (gallery) {
  const extras = [
    ['Logo MeowZone','Art/Logo MeowZone.png'],['Banner de MeowZone','Art/YT Banner.png'],
    ['Jinu','Art/Portraits/Jinu.png'],
    ['Taeo','Art/Portraits/Taeo.png'],
    ['Siwoo','Art/Portraits/Siwoo.png'],
    ['Escenario 1','Art/Live Stage 1.png'],['Escenario 2','Art/Live Stage 2.png'],
    ['MeowZone IRL','Art/IRL MeowZone.png']
  ];
  const items = [...extras.map(([name,path])=>({name,path,type:'Arte'})),...tracks.map(t=>({name:t.title,path:coverPath(t.cover),type:'Portada',link:meowSongUrl(t)}))];
  function showGallery(filter) {
    gallery.innerHTML = items.filter(item=>filter==='Todo'||item.type===filter).map(item=>'<article class="gallery-card"><a href="'+item.path+'" download><img loading="lazy" src="'+item.path+'" alt="'+meowEscape(item.name)+'"></a><div><span>'+item.type+'</span><h2>'+meowEscape(item.name)+'</h2><a href="'+item.path+'" download>Descargar imagen ↓</a>'+(item.link?'<a href="'+item.link+'">Ver canción →</a>':'')+'</div></article>').join('');
  }
  document.querySelectorAll('[data-gallery-filter]').forEach(button=>button.addEventListener('click',()=>{ document.querySelectorAll('[data-gallery-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button))); showGallery(button.dataset.galleryFilter); }));
  showGallery('Todo');
}
document.querySelector('.copy-bio')?.addEventListener('click', async event => {
  const bio = document.querySelector('.press-bio').textContent.trim();
  try { await navigator.clipboard.writeText(bio); event.currentTarget.textContent='Presentación copiada ✓'; }
  catch (_) { event.currentTarget.textContent='Selecciona y copia el texto'; window.getSelection()?.selectAllChildren(document.querySelector('.press-bio')); }
});
meowUpdateLibrary();
