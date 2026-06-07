const placeholderSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Player placeholder">
  <defs>
	<linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
	  <stop offset="0%" stop-color="#f8fafc"/>
	  <stop offset="100%" stop-color="#a7b3b0"/>
	</linearGradient>
  </defs>
  <rect width="256" height="256" rx="128" fill="#0f172a"/>
  <circle cx="128" cy="96" r="44" fill="url(#g)"/>
  <path d="M56 214c12-40 41-64 72-64s60 24 72 64" fill="url(#g)"/>
  <circle cx="128" cy="128" r="108" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="10"/>
</svg>`;

const fallbackImage = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(placeholderSvg)}`;

async function loadLineup(filePath) {
	try {
		const response = await fetch(filePath);
		if (!response.ok) throw new Error(`Failed to load ${filePath}`);
		return await response.json();
	} catch (error) {
		console.error('Error loading lineup:', error);
		return {};
	}
}

function getCurrentPageBaseName() {
	const fileName = window.location.pathname.split('/').pop() || '';
	return fileName.replace(/\.html$/i, '');
}

async function loadTeamLineup() {
	const pageBaseName = getCurrentPageBaseName();
	if (!pageBaseName) {
		console.error('Page filename not found; lineup cannot be loaded.');
		return {};
	}

	const lineupFileName = `${pageBaseName}.json`;
	const lineupPaths = [
		`../assets/data/lineups/${lineupFileName}`,
		`../lineups/${lineupFileName}`,
		`./lineups/${lineupFileName}`,
	];

	for (const filePath of lineupPaths) {
		const lineupData = await loadLineup(filePath);
		if (Array.isArray(lineupData.rows) && Array.isArray(lineupData.players)) {
			return lineupData;
		}
	}

	return {};
}

function buildPlayerCard(player) {
	const card = document.createElement('article');
	card.className = `player player--${player.role}`;

	if (!player.image) {
		card.classList.add('player--placeholder');
	}

	const name = document.createElement('p');
	name.className = 'player-name';
	name.textContent = player.name;

	const image = document.createElement('img');
	image.className = 'player-image';
	image.alt = `${player.name} portrait`;
	image.loading = 'lazy';
	image.src = player.image || fallbackImage;
	image.addEventListener('error', () => {
		image.src = fallbackImage;
	}, { once: true });

	card.append(name, image);
	return card;
}

const rows = document.querySelectorAll('[data-row]');

function initializeLineup(lineupData) {
	const formation = document.querySelector('.formation');
	if (!formation || !Array.isArray(lineupData?.rows) || !Array.isArray(lineupData?.players)) {
		return;
	}
	
	// Clear existing rows
	formation.innerHTML = '';
	
	// Set data attribute for row count (useful for CSS/JS reference)
	formation.setAttribute('data-row-count', lineupData.rows.length);
	
	// Create rows based on lineup data
	lineupData.rows.forEach((rowType) => {
		const rowDiv = document.createElement('div');
		rowDiv.className = `line line--${rowType}`;
		rowDiv.setAttribute('data-row', rowType);
		formation.appendChild(rowDiv);
	});
	
	// Populate players in each row
	const updatedRows = document.querySelectorAll('[data-row]');
	updatedRows.forEach((row) => {
		const rowName = row.dataset.row;
		const rowPlayers = lineupData.players.filter((player) => player.row === rowName);
		
		rowPlayers.forEach((player) => {
			row.appendChild(buildPlayerCard(player));
		});
	});
}

// Initialize with lineup loaded from the team heading
void loadTeamLineup().then((lineupData) => {
	initializeLineup(lineupData);
});