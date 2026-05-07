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

const players = [
	{
		row: 'gk',
		name: 'A. Tchouameni',
		image: './img/goalie.jpg',
		role: 'goalkeeper'
	},
	{
		row: 'defense',
		name: 'Goat. Martín',
		image: './img/defender.jpg',
		role: 'defender'
	},
	{
		row: 'defense',
		name: 'Goat. Martín',
		image: './img/defender.jpg',
		role: 'defender'
	},
	{
		row: 'defense',
		name: 'Goat. Martín',
		image: './img/defender.jpg',
		role: 'defender'
	},
	{
		row: 'defense',
		name: 'Goat. Martín',
		image: './img/defender.jpg',
		role: 'defender'
	},
	{
		row: 'midfield',
		name: 'Ndombele',
		image: './img/midfielder.jpg',
		role: 'midfielder'
	},
	{
		row: 'midfield',
		name: 'Ndombele',
		image: './img/midfielder.jpg',
		role: 'midfielder'
	},
	{
		row: 'midfield',
		name: 'Ndombele',
		image: './img/midfielder.jpg',
		role: 'midfielder'
	},
	{
		row: 'attack',
		name: 'Martinelli',
		image: './img/left-wg.jpg',
		role: 'attacker'
	},
	{
		row: 'attack',
		name: 'Darwin Núñez',
		image: './img/striker.jpg',
		role: 'attacker'
	},
	{
		row: 'attack',
		name: 'Mudryk',
		image: './img/right-wg.jpg',
		role: 'attacker'
	}
];

const rowCounts = {
	gk: 1,
	defense: 4,
	midfield: 3,
	attack: 3
};

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

rows.forEach((row) => {
	const rowName = row.dataset.row;
	const count = rowCounts[rowName] || 0;
	const rowPlayers = players.filter((player) => player.row === rowName).slice(0, count);

	rowPlayers.forEach((player) => {
		row.appendChild(buildPlayerCard(player));
	});
});
