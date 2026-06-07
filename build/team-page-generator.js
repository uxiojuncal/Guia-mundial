const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const TEAMS_JSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'teams.json'), 'utf8'));
const GROUPS = TEAMS_JSON.groups;
const TEAMS_DATA = TEAMS_JSON['teams-content'];
const TEAMS_LIST = TEAMS_DATA.map(team => team.name);
const NAV_LISTS = [GROUPS, TEAMS_LIST];
const TEMPLATE = path.resolve(__dirname, 'team-template.html');
const OUT_DIR = path.resolve(__dirname, '../dist/teams');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const templateHtml = fs.readFileSync(TEMPLATE, 'utf8');

function slugifyFileName(name) {
  return `${name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}.html`;
}

function populateTemplate($, data) {
  // Fill navigation bars
  const navData = { name: data.name, group: data.group };
  populateNavBars($, navData);

  // Fill slots
  $('[data-slot]').each((i, el) => {
    // Extract slot name and value
    const slot = $(el).attr('data-slot');
    if (!slot) return;
    const value = data[slot];
    if (value === undefined) return;

    // Extract the type (default to 'text')
    const type = $(el).attr('data-type') || 'text';

    // Population for lists and single values
    if (type === 'list' && Array.isArray(value)) {
      // Clear existing content
      $(el).empty();

      // Append each item as a list element or image
      value.forEach(player => {
        addListPlayer($, el, player);
      });

    } else if ($(el).is('img')) {
      $(el).attr('src', value);
      if (data[`${slot}-alt`]) $(el).attr('alt', data[`${slot}-alt`]);
    } else if (slot === 'team-subtitle' && data.subtitle !== undefined) {
      $(el).html(data.subtitle);
    } else {
      $(el).html(value);
    }
  });

  return $.html();
}

function addListPlayer($, container, playerObj) {
  // Create formated string with the content of the player object
  let content;

  if (typeof playerObj === 'object' && playerObj !== null) {
    const extraInfo = [playerObj.age, playerObj.club].filter(Boolean).join(', ');
    content = `<li><b>${playerObj.name}${extraInfo ? ` (${extraInfo})` : ''}:</b> ${playerObj.description || ''}</li>`;
  } else {
    console.error(`Expected player object, but got:`, playerObj);
    content = playerObj; // Fallback to raw value
  }

  // Append the formatted string to the container
  $(container).append(content);
}

function populateNavBars($, navData) {
  const currentIndex = TEAMS_LIST.indexOf(navData.name);
  if (currentIndex === -1) {
    return;
  }

  const currentGroupIndex = GROUPS.indexOf(navData.group);

  const teamNav = {
    prev: TEAMS_LIST[(currentIndex - 1 + TEAMS_LIST.length) % TEAMS_LIST.length],
    current: navData.name,
    next: TEAMS_LIST[(currentIndex + 1) % TEAMS_LIST.length],
  };

  const groupNavRefs = {
    prev: TEAMS_LIST[(currentIndex - 4 + TEAMS_LIST.length) % TEAMS_LIST.length],
    current: navData.name,
    next: TEAMS_LIST[(currentIndex + 4) % TEAMS_LIST.length],
  };

  const groupNavLabels = {
    prev: GROUPS[(currentGroupIndex - 1 + GROUPS.length) % GROUPS.length],
    current: navData.group,
    next: GROUPS[(currentGroupIndex + 1) % GROUPS.length],
  };

  const navMap = {
    team: teamNav,
    group: groupNavRefs,
  };

  Object.entries(navMap).forEach(([navType, items]) => {
    const prevLink = $(`[data-link="prev-${navType}"] a`);
    const currentLink = $(`[data-link="${navType}"] a`);
    const nextLink = $(`[data-link="next-${navType}"] a`);

    const labels = navType === 'group' ? groupNavLabels : items;

    prevLink.attr('href', slugifyFileName(items.prev)).text(labels.prev);
    currentLink.attr('href', slugifyFileName(items.current)).text(labels.current);
    nextLink.attr('href', slugifyFileName(items.next)).text(labels.next);
  });
}

TEAMS_DATA.forEach(team => {
  const $ = cheerio.load(templateHtml);
  const html = populateTemplate($, team);
  const outputFile = path.resolve(OUT_DIR, slugifyFileName(team.name));

  fs.writeFileSync(outputFile, html, 'utf8');
});

console.log(`Generated ${TEAMS_DATA.length} team pages in ${OUT_DIR}`);
