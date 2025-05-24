// kennaramalabord_script.js

// SLÓÐ Á ÞÍNA "PUBLISHED TO THE WEB" CSV SKRÁ FRÁ GOOGLE SHEETS
// ÞESSI SLÓÐ VERÐUR AÐ VERA NÁKVÆMLEGA SÚ SEM ÞÚ FÆRÐ FRÁ GOOGLE SHEETS
// OG Á AÐ ENDA Á /pub?output=csv
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRvZJCawNRI8GOT9EwH8jLX0gC40tS1pRTGzDzxyDxFTgT_-nV92MA-X0Z6WGg9T2Ay0joS4DiX6gAG/pub?output=csv';

const tableBody = document.querySelector('#group-status-table tbody');
const tableHead = document.querySelector('#group-status-table thead');
const refreshButton = document.getElementById('refresh-data-button');
const lastUpdatedElem = document.getElementById('last-updated-time');

async function fetchDataAndDisplay() {
    if (GOOGLE_SHEET_CSV_URL === '' || GOOGLE_SHEET_CSV_URL === 'SLÓÐ_KEMUR_HÉR') {
        if(tableBody) {
            tableBody.innerHTML = `<tr><td colspan="12" style="color:red; text-align:center;">Villa: CSV slóð er ekki skilgreind í kennaramalabord_script.js.</td></tr>`;
        }
        return;
    }

    if(tableBody) {
        tableBody.innerHTML = `<tr><td colspan="12" style="text-align:center;">Sæki nýjustu gögn...</td></tr>`;
    }

    try {
        // HÉR NOTUM VIÐ BREYTUNA OG RÉTT TÁKN FYRIR TIMESTAMP
        const response = await fetch(GOOGLE_SHEET_CSV_URL + '×tamp=' + new Date().getTime()); 
        
        if (!response.ok) {
            // Ef það kemur villa frá servernum (t.d. 404 Not Found), þá er slóðin líklega röng
            // eða skjalið ekki rétt "published".
            throw new Error(`HTTP villa! Staða: ${response.status}. Gakktu úr skugga um að skjalið sé "Published to the web" sem CSV og að CSV slóðin sé rétt.`);
        }
        const csvText = await response.text();
        processCSV(csvText);
        if (lastUpdatedElem) {
            lastUpdatedElem.textContent = `Síðast uppfært: ${new Date().toLocaleTimeString('is-IS')}`;
        }
    } catch (error) {
        // Þessi catch blokk höndlar bæði netvillur (t.d. CORS, DNS) OG villur sem við köstum (throw) hér að ofan.
        console.error('Villa í fetchDataAndDisplay:', error);
        if(tableBody) {
            tableBody.innerHTML = `<tr><td colspan="12" style="color:red; text-align:center;">Ekki tókst að sækja gögn. ${error.message} Athugaðu Developer Console.</td></tr>`;
        }
    }
}

// ... (restin af processCSV fallinu og event listeners helst óbreytt) ...
function processCSV(csvText) {
    if (!tableBody || !tableHead) {
        console.error("Töfluelement (tbody eða thead) fannst ekki.");
        return;
    }
    const rows = csvText.trim().split('\n');
    if (rows.length === 0 || (rows.length === 1 && rows[0].trim() === '')) {
        tableBody.innerHTML = '<tr><td colspan="12" style="text-align:center;">Engin gögn fundust í CSV skránni eða skráin er tóm.</td></tr>';
        return;
    }
    const headers = rows[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
    tableHead.innerHTML = ''; 
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);
    tableBody.innerHTML = ''; 
    let validDataRows = 0;
    for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === "") continue;
        const cells = rows[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
        if (cells.length < headers.length && cells.join("").trim() !== "") {
             console.warn(`Röð ${i+1} inniheldur ${cells.length} reiti en það eru ${headers.length} hausar. Gæti vantað gögn. Röð: "${rows[i]}"`);
             while(cells.length < headers.length) {
                 cells.push("");
             }
        }
        const dataRow = document.createElement('tr');
        headers.forEach((header, index) => {
            const td = document.createElement('td');
            const cellText = cells[index] || ""; 
            const trimmedCellText = cellText.trim();
            const headerName = header.toLowerCase(); 
            if (headerName.includes('samþykkt') || headerName.includes('sent') || headerName.includes('þarfaðstoð') || headerName.includes('þarf aðstoð')) {
                td.classList.add('checkbox-display');
                if (trimmedCellText.toLowerCase() === 'já' || trimmedCellText.toLowerCase() === 'true') {
                    td.classList.add('checked');
                } else {
                    td.classList.add('unchecked');
                }
            } else if (headerName.includes('staðaafurðar') || headerName.includes('staðakynningar')) {
                td.textContent = trimmedCellText;
                const statusClass = trimmedCellText.toLowerCase().replace(/\s+/g, '');
                if (statusClass === 'lokið') td.classList.add('status-lokid');
                else if (statusClass === 'ívinnslu' || statusClass === 'íundirbúningi') td.classList.add('status-i-vinnslu');
                else if (statusClass === 'ekkihafið') td.classList.add('status-ekki-hafinn');
                else if (statusClass === 'drögtilbúin') td.classList.add('status-i-vinnslu');
            }
            else {
                td.textContent = trimmedCellText;
            }
            dataRow.appendChild(td);
        });
        tableBody.appendChild(dataRow);
        validDataRows++;
    }
    if (validDataRows === 0 && headers.length > 0 && headers[0] !== "") { 
        tableBody.innerHTML = `<tr><td colspan="${headers.length}" style="text-align:center;">Engin gögn (fyrir utan hausa) fundust í skjalinu. Vinsamlegast bættu við gögnum í Google Sheet.</td></tr>`;
    } else if (headers.length === 0 || (headers.length === 1 && headers[0] === "")) {
         tableBody.innerHTML = `<tr><td colspan="12" style="text-align:center;">Engir hausar fundust í CSV skjalinu. Gakktu úr skugga um að fyrsta línan í Google Sheet innihaldi fyrirsagnir.</td></tr>`;
    }
}
document.addEventListener('DOMContentLoaded', fetchDataAndDisplay);
if (refreshButton) {
    refreshButton.addEventListener('click', fetchDataAndDisplay);
}
// setInterval(fetchDataAndDisplay, 300000); // 5 mínútur