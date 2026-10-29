const achievements = [
  {
    id: 'quickdraw',
    name: 'Quickdraw',
    symbol: '↯',
    kind: 'Logro activo',
    free: true,
    people: false,
    description: 'Cierra una issue o un pull request poco después de abrirlo. Hazlo solo cuando el tema esté realmente resuelto.',
    threshold: 'La guía comunitaria reporta un límite de 5 minutos. GitHub no publica una tabla oficial completa de umbrales.',
    source: 'https://github.com/christianalberto/github-profile-achievements'
  },
  {
    id: 'yolo',
    name: 'YOLO',
    symbol: '↗',
    kind: 'Logro activo',
    free: true,
    people: false,
    description: 'Fusiona un pull request propio sin revisión. Es una insignia de una sola vez; revisa tu cambio antes de fusionarlo.',
    threshold: 'Una fusión sin review. El criterio se muestra en los detalles del logro de GitHub.',
    source: 'https://docs.github.com/en/account-and-profile/reference/profile-reference'
  },
  {
    id: 'pull-shark',
    name: 'Pull Shark',
    symbol: '⌁',
    kind: 'Logro activo',
    free: true,
    people: true,
    description: 'Consigue que se fusionen pull requests tuyos. Elige cambios útiles y sigue las reglas del proyecto.',
    threshold: 'La referencia comunitaria informa 2 PR fusionados para el primer nivel. La API de esta guía no puede confirmar si GitHub ya concedió el logro.',
    source: 'https://github.com/christianalberto/github-profile-achievements'
  },
  {
    id: 'pair-extraordinaire',
    name: 'Pair Extraordinaire',
    symbol: '⟷',
    kind: 'Logro activo',
    free: true,
    people: true,
    description: 'Participa como coautor en commits de un pull request que después se fusione. La coautoría debe corresponder a trabajo real.',
    threshold: 'La referencia comunitaria informa 1 PR coescrito para el primer nivel. Requiere otra persona como coautora.',
    source: 'https://github.com/christianalberto/github-profile-achievements'
  },
  {
    id: 'galaxy-brain',
    name: 'Galaxy Brain',
    symbol: '✦',
    kind: 'Logro activo',
    free: true,
    people: true,
    description: 'Da respuestas útiles en GitHub Discussions y recibe una marca de respuesta aceptada.',
    threshold: 'La referencia comunitaria informa 2 respuestas aceptadas para el primer nivel. La aceptación depende de quien abrió la conversación.',
    source: 'https://github.com/christianalberto/github-profile-achievements'
  },
  {
    id: 'starstruck',
    name: 'Starstruck',
    symbol: '☆',
    kind: 'Logro activo',
    free: true,
    people: true,
    description: 'Mantén un proyecto propio útil y claro para que otras personas quieran usarlo y darle una estrella.',
    threshold: 'La referencia comunitaria informa 16 estrellas en un repositorio que creaste para el primer nivel. No pidas estrellas sin motivo.',
    source: 'https://github.com/christianalberto/github-profile-achievements'
  },
  {
    id: 'public-sponsor',
    name: 'Public Sponsor',
    symbol: '♡',
    kind: 'Logro activo',
    free: false,
    people: false,
    description: 'Patrocina públicamente el trabajo de una persona desarrolladora mediante GitHub Sponsors.',
    threshold: 'Implica un patrocinio con coste; queda fuera del filtro gratuito.',
    source: 'https://github.com/sponsors'
  }
];

const storageKey = 'insignias-github-progress-v1';
const form = document.querySelector('#profile-form');
const usernameInput = document.querySelector('#username');
const statusLine = document.querySelector('#status');
const resultPanel = document.querySelector('#profile-results');
const loadButton = document.querySelector('#load-profile');
const achievementList = document.querySelector('#achievement-list');
let activeFilter = 'free';

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

function writeProgress(progress) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  } catch {
    setStatus('El navegador no permitió guardar el progreso; puedes seguir usando la guía.', false);
  }
}

function setStatus(message, isError) {
  statusLine.textContent = message;
  statusLine.classList.toggle('is-error', Boolean(isError));
}

function renderAchievements() {
  const progress = readProgress();
  const visible = achievements.filter(function (item) {
    if (activeFilter === 'free') return item.free;
    if (activeFilter === 'needs-people') return item.people;
    return true;
  });

  achievementList.innerHTML = visible.map(function (item) {
    const checked = Boolean(progress[item.id]);
    const costTag = item.free
      ? '<span class="tag tag-free">Gratis</span>'
      : '<span class="tag tag-paid">Con coste</span>';
    const peopleTag = item.people ? '<span class="tag tag-people">Depende de otras personas</span>' : '';
    return '<article class="achievement-card">' +
      '<div class="card-top"><div class="badge-identity"><span class="badge-symbol" aria-hidden="true">' + item.symbol + '</span>' +
      '<div><h3>' + item.name + '</h3><span class="card-kind">' + item.kind + '</span></div></div>' +
      '<div class="badge-tags">' + costTag + peopleTag + '</div></div>' +
      '<p class="achievement-description">' + item.description + '</p>' +
      '<div class="threshold"><strong>Referencia:</strong> ' + item.threshold + '</div>' +
      '<div class="card-bottom"><a class="source-link" href="' + item.source + '" target="_blank" rel="noreferrer">Ver fuente ↗</a>' +
      '<label class="earned-label' + (checked ? ' is-earned' : '') + '"><input type="checkbox" data-achievement="' + item.id + '"' + (checked ? ' checked' : '') + '> Ya la tengo</label></div>' +
      '</article>';
  }).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character];
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-AR').format(Number(value) || 0);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (!response.ok) {
    if (response.status === 404) throw new Error('No encontré ese usuario público.');
    if (response.status === 403 || response.status === 429) throw new Error('GitHub limitó temporalmente las consultas públicas. Prueba de nuevo más tarde.');
    throw new Error('GitHub respondió con un error (' + response.status + ').');
  }
  return response.json();
}

async function fetchRepositories(username) {
  let nextUrl = 'https://api.github.com/users/' + encodeURIComponent(username) + '/repos?per_page=100&sort=stars';
  const repositories = [];
  let pageCount = 0;
  while (nextUrl && pageCount < 10) {
    const response = await fetch(nextUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) throw new Error('GitHub limitó temporalmente las consultas públicas. Prueba de nuevo más tarde.');
      throw new Error('No pude cargar los repositorios públicos (' + response.status + ').');
    }
    const page = await response.json();
    repositories.push.apply(repositories, page);
    const linkHeader = response.headers.get('Link') || '';
    const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    nextUrl = nextMatch ? nextMatch[1] : '';
    pageCount += 1;
  }
  return repositories;
}

function renderProfile(profile, repositories, mergedCount) {
  const strongestRepo = repositories.reduce(function (best, repo) {
    return !best || repo.stargazers_count > best.stargazers_count ? repo : best;
  }, null);
  const stars = strongestRepo ? strongestRepo.stargazers_count : 0;
  const starsPercent = Math.min(100, Math.round((stars / 16) * 100));
  const repoLink = strongestRepo
    ? '<a class="source-link" href="' + escapeHtml(strongestRepo.html_url) + '" target="_blank" rel="noreferrer">' + escapeHtml(strongestRepo.full_name) + ' ↗</a>'
    : 'Sin repositorios públicos';
  const avatar = escapeHtml(profile.avatar_url);
  const profileUrl = escapeHtml(profile.html_url);
  const name = escapeHtml(profile.name || profile.login);
  const bio = profile.bio ? ' · ' + escapeHtml(profile.bio) : '';
  const mergedLabel = mergedCount == null ? 'no disponible' : formatNumber(mergedCount);

  resultPanel.innerHTML =
    '<div class="profile-top"><img class="avatar" src="' + avatar + '" alt="" width="48" height="48">' +
    '<div><p class="profile-name"><a href="' + profileUrl + '" target="_blank" rel="noreferrer">@' + escapeHtml(profile.login) + '</a></p>' +
    '<p class="profile-meta">' + name + bio + '</p></div></div>' +
    '<div class="profile-stats">' +
    '<div class="stat"><div class="stat-value">' + formatNumber(repositories.length) + '</div><div class="stat-label">repositorios públicos consultados</div></div>' +
    '<div class="stat"><div class="stat-value">' + formatNumber(profile.followers) + '</div><div class="stat-label">personas seguidoras (dato público)</div></div>' +
    '<div class="stat"><div class="stat-value">' + formatNumber(stars) + ' / 16</div><div class="stat-label">estrellas en el repo propio más destacado · ' + repoLink + '</div>' +
    '<div class="star-progress" aria-label="' + starsPercent + '% del umbral comunitario de 16 estrellas"><span style="width:' + starsPercent + '%"></span></div></div></div>' +
    '<p class="profile-meta" style="margin-top:12px">La búsqueda pública encontró ' + mergedLabel + ' PR fusionados. Ese número no confirma por sí solo un logro: GitHub no expone Achievements en la API pública.</p>';
  resultPanel.hidden = false;
}

async function loadProfile(event) {
  if (event) event.preventDefault();
  const username = usernameInput.value.trim();
  if (!/^(?!-)(?!.*--)[a-z\d-]{1,39}(?<!-)$/i.test(username)) {
    setStatus('Escribe un nombre de usuario válido de GitHub.', true);
    usernameInput.focus();
    return;
  }

  loadButton.disabled = true;
  resultPanel.hidden = true;
  setStatus('Consultando datos públicos de GitHub…', false);
  try {
    const searchQuery = new URLSearchParams({ q: 'author:' + username + ' is:pr is:merged', per_page: '1' });
    const results = await Promise.all([
      fetchJson('https://api.github.com/users/' + encodeURIComponent(username)),
      fetchRepositories(username),
      fetchJson('https://api.github.com/search/issues?' + searchQuery.toString()).catch(function () { return { total_count: null }; })
    ]);
    renderProfile(results[0], results[1], results[2].total_count);
    setStatus('Consulta terminada. Los datos son públicos y pueden tardar en actualizarse.', false);
  } catch (error) {
    setStatus(error.message || 'No se pudo consultar la cuenta.', true);
  } finally {
    loadButton.disabled = false;
  }
}

form.addEventListener('submit', loadProfile);
document.querySelectorAll('.filter-button').forEach(function (button) {
  button.addEventListener('click', function () {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter-button').forEach(function (candidate) {
      const selected = candidate === button;
      candidate.classList.toggle('is-selected', selected);
      candidate.setAttribute('aria-pressed', String(selected));
    });
    renderAchievements();
  });
});
achievementList.addEventListener('change', function (event) {
  const checkbox = event.target.closest('input[data-achievement]');
  if (!checkbox) return;
  const progress = readProgress();
  progress[checkbox.dataset.achievement] = checkbox.checked;
  writeProgress(progress);
  renderAchievements();
});

renderAchievements();
loadProfile();
