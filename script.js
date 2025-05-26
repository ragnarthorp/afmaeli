// script.js (fyrir index.html)

// Gagnagrunnur sem parar saman lykilorð og slóðina á viðeigandi sérsviðssíðu
const PASSWORD_TO_URL_MAP = {
    // --- ARKITEKTAR ---
    'ArkitektStart20': 'sersvid/arkitektar_verkefni.html',    // Stig 1
    'ArkitektPlan24':  'sersvid/arkitektar_djupkofun.html',   // Stig 2

    // --- LEIKHÓPUR ---
    'LeiklistGrunnur': 'sersvid/leikhopur_svidslist.html',    // Stig 1
    'LeikurMeistarar': 'sersvid/leikhopur_djupkofun.html',   // Stig 2

    // --- FRÉTTAVEITA ---
    'FrettirNSafmæli': 'sersvid/frettaveita_midlun.html',    // Stig 1
    'MidlunProff20':   'sersvid/frettaveita_djupkofun.html', // Stig 2

    // --- HÖNNUNARSTOFA ---
    'HönnunStartNS':   'sersvid/honnunarstofa_skopun.html',    // Stig 1
    'SköpunMeistari':  'sersvid/honnunarstofa_djupkofun.html' // Stig 2
};

function checkPasswordAndRedirect() {
    const passwordInputElem = document.getElementById('password');
    const errorMessageElem = document.getElementById('error-message');

    // Athuga hvort nauðsynleg HTML element séu til á síðunni
    if (!passwordInputElem || !errorMessageElem) {
        // Þessi console.error er aðallega fyrir þig sem þróunaraðila ef eitthvað er vitlaust í HTML
        console.error("Villa í script.js: Lykilorðareitur ('password') eða villuskilaboðasvæði ('error-message') fannst ekki á HTML síðunni. Gakktu úr skugga um að id séu rétt.");
        return; // Stöðva keyrslu fallsins ef element vantar
    }

    const enteredPassword = passwordInputElem.value; // Ná í gildið sem slegið var inn

    if (PASSWORD_TO_URL_MAP.hasOwnProperty(enteredPassword)) {
        // Ef innslegið lykilorð finnst sem "lykill" (key) í PASSWORD_TO_URL_MAP objectinu
        const targetUrl = PASSWORD_TO_URL_MAP[enteredPassword]; // Ná í samsvarandi vefslóð (value)
        
        window.location.href = targetUrl; // Vísa vafra notanda á þá síðu
        
        errorMessageElem.textContent = ''; // Hreinsa villuskilaboð (ef einhver voru frá fyrri tilraun)
    } else {
        // Ef lykilorðið fannst ekki í PASSWORD_TO_URL_MAP
        errorMessageElem.textContent = 'Rangt lykilorð eða lykilorð er ekki skráð. Reyndu aftur eða hafðu samband við kennara.';
        passwordInputElem.value = ''; // Hreinsa innsláttarreitinn fyrir lykilorð
        passwordInputElem.focus(); // Setja fókus aftur á lykilorðareitinn til þæginda
    }
}

// Keyra checkPasswordAndRedirect ef ýtt er á Enter takkann þegar fókus er á lykilorðareitnum
document.addEventListener('DOMContentLoaded', (event) => {
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                checkPasswordAndRedirect();
            }
        });
    }
});
