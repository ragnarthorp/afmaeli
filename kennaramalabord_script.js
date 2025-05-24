// kennaramalabord_script.js

// SLÓÐ Á "EXPORT CSV" FRÁ GOOGLE SHEETS  (leið nr. 2)
const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1EXK2JEDYPZXpCPw_-ZdrQqOoDmAGtgJMoWIvFDaSNz8/export?format=csv&gid=0';

const tableBody       = document.querySelector('#group-status-table tbody');
const tableHead       = document.querySelector('#group-status-table thead');
const refreshButton   = document.getElementById('refresh-data-button');
const lastUpdatedElem = document.getElementById('last-updated-time');

// —— Sækir gögnin og birtir í töflu ————————————————————————————————
async function fetchDataAndDisplay() {
  if (!GOOGLE_SHEET_CSV_URL || GOOGLE_SHEET_CSV_URL === 'SLÓÐ_KEMUR_HÉR') {
    if (tableBody) {
      tableBody.innerHTML =
        `<tr><td colspan="12" style="color:red;text-align:center;">
           Villa: CSV-slóð er ekki skilgreind í kennaramalabord_script.js.
         </td></tr>`;
    }
    return;
  }

  if (tableBody) {
    tableBody.innerHTML =
      `<tr><td colspan="12" style="text-align:center;">
         Sæki nýjustu gögn…
       </td></tr>`;
  }

  try {
    // Bætum tímastimpli við til að framhjá-keyra skyndiminni
    const response = await fetch(`${GOOGLE_SHEET_CSV_URL}&timestamp=${Date.now()}`);

    if (!response.ok) {
      throw new Error(
        `HTTP villa! Staða ${response.status}. ` +
        `Gakktu úr skugga um að skjalið sé "Anyone with the link → Viewer" ` +
        `og að slóðin sé rétt.`
      );
    }

    const csvText = await response.text();
    processCSV(csvText);

    if (lastUpdatedElem) {
      lastUpdatedElem.textContent =
        `Síðast uppfært: ${new Date().toLocaleTimeString('is-IS')}`;
    }
  } catch (error) {
    console.error('Villa í fetchDataAndDisplay:', error);
    if (tableBody) {
      tableBody.innerHTML =
        `<tr><td colspan="12" style="color:red;text-align:center;">
           Ekki tókst að sækja gögn. ${error.message}
         </td></tr>`;
    }
  }
}

// —— Vinnur úr CSV og setur í HTML-töflu ————————————————————————————
function processCSV(csvText) {
  if (!tableBody || !tableHead) {
    console.error('Töfluelement (tbody eða thead) fannst ekki.');
    return;
  }

  const rows = csvText.trim().split('\n');
  if (rows.length === 0 || (rows.length === 1 && rows[0].trim() === '')) {
    tableBody.innerHTML =
      '<tr><td colspan="12" style="text-align:center;">Engin gögn fundust í CSV-skránni eða skráin er tóm.</td></tr>';
    return;
  }

  // — Hausar —
  const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  tableHead.innerHTML = '';
  const headerRow = document.createElement('tr');
  headers.forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  // — Gögn —
  tableBody.innerHTML = '';
  let validRows = 0;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].trim() === '') continue;

    const cells = rows[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    while (cells.length < headers.length) cells.push('');   // fyllir upp vantaða dálka

    const tr = document.createElement('tr');

    headers.forEach((header, idx) => {
      const td        = document.createElement('td');
      const cellVal   = (cells[idx] || '').trim();
      const headerKey = header.toLowerCase();

      // — Sérmeðhöndlun á „checkbox“ dálkum —
      if (headerKey.includes('samþykkt')   ||
          headerKey.includes('sent')       ||
          headerKey.includes('þarfaðstoð') ||
          headerKey.includes('þarf aðstoð'))
      {
        td.classList.add('checkbox-display');
        if (['já', 'true', 'x', '✓'].includes(cellVal.toLowerCase())) {
          td.classList.add('checked');
        } else {
          td.classList.add('unchecked');
        }
      }
      // — Status litakóðun —
      else if (headerKey.includes('staðaafurðar') ||
               headerKey.includes('staðakynningar'))
      {
        td.textContent = cellVal;
        const status = cellVal.toLowerCase().replace(/\s+/g, '');
        if      (status === 'lokið')         td.classList.add('status-lokid');
        else if (['ívinnslu','íundirbúningi','drögtilbúin'].includes(status))
                                             td.classList.add('status-i-vinnslu');
        else if (status === 'ekkihafið')     td.classList.add('status-ekki-hafinn');
      }
      // — Venjulegir dálkar —
      else {
        td.textContent = cellVal;
      }

      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
    validRows++;
  }

  if (validRows === 0) {
    tableBody.innerHTML =
      `<tr><td colspan="${headers.length}" style="text-align:center;">
         Engin gögn (fyrir utan hausa) fundust í skjalinu. 
         Vinsamlegast bættu við línum í Google Sheet.
       </td></tr>`;
  }
}

// ————————————————————————————————————————————————————————————————
document.addEventListener('DOMContentLoaded', fetchDataAndDisplay);

if (refreshButton) {
  refreshButton.addEventListener('click', fetchDataAndDisplay);
}

// Til að uppfæra sjálfkrafa á 5 mín. fresti:
// setInterval(fetchDataAndDisplay, 5 * 60 * 1000);
