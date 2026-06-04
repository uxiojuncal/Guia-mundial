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
  // Populate group navigation
  const navTypes = ['group', 'team'];
  const indexes = [GROUPS.indexOf(navData.group), TEAMS_LIST.indexOf(navData.name)];
  NAV_LISTS.forEach((list, index) => {
    // Extract navigation type and current index
    const navType = navTypes[index];
    const currentIndex = indexes[index];
    const prevLink = $(`[data-link="prev-${navType}"] a`);
    const currentLink = $(`[data-link="${navType}"] a`);
    const nextLink = $(`[data-link="next-${navType}"] a`);

    // If indexes ara not found, disable links and clear text
    if (currentIndex === -1) {
      prevLink.attr('href', '#').text('');
      currentLink.attr('href', '#').text('');
      nextLink.attr('href', '#').text('');
      return;
    }

    // Determine previous and next items with circular wrapping
    const prevItem = list[(currentIndex - 1 + list.length) % list.length];
    const nextItem = list[(currentIndex + 1) % list.length];
    const prevHref = slugifyFileName(prevItem);
    const currentHref = navType === 'team' ? slugifyFileName(navData.name) : '#';
    const nextHref = slugifyFileName(nextItem);

    prevLink.attr('href', prevHref).text(prevItem);
    currentLink.attr('href', currentHref).text(navData[navType] || navData.name);
    nextLink.attr('href', nextHref).text(nextItem);
  });
}

TEAMS_DATA.forEach(team => {
  const $ = cheerio.load(templateHtml);
  const html = populateTemplate($, team);
  const outputFile = path.resolve(OUT_DIR, slugifyFileName(team.name));

  fs.writeFileSync(outputFile, html, 'utf8');
});

console.log(`Generated ${TEAMS_DATA.length} team pages in ${OUT_DIR}`);
