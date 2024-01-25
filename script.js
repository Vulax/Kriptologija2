let encryptionKey;
let encryptionIV; 
let encryptedMetadata; 

function extractAndEncrypt() {
    const uploadInput = document.getElementById('uploadInput');
    const encryptionSelect = document.getElementById('encryptionSelect');

    if (uploadInput.files.length === 0) {
        alert('Ubacite sliku.');
        return;
    }

    const selectedFile = uploadInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const image = new Image();
        image.src = e.target.result;

        image.onload = function () {
            EXIF.getData(image, function () {
                const metadata = EXIF.pretty(this);

                // 256-bit ključ
                encryptionKey = CryptoJS.lib.WordArray.random(256 / 8);

                // 128-bit IV
                encryptionIV = CryptoJS.lib.WordArray.random(128 / 8);

                encryptedMetadata = metadata;
                const encryptionAlgorithm = encryptionSelect.value;
                if (encryptionAlgorithm === 'aes') {
                    encryptedMetadata = CryptoJS.AES.encrypt(metadata, encryptionKey, { iv: encryptionIV }).toString();
                }

                alert('Metapodaci eksportovani i šifrovani.');
            });
        };
    };

    reader.readAsDataURL(selectedFile);
}

function downloadKey() {
    if (encryptionKey) {
        const keyBlob = new Blob([encryptionKey.toString()], { type: 'text/plain' });
        const keyLink = document.getElementById('downloadLinkKey');
        keyLink.href = URL.createObjectURL(keyBlob);
        keyLink.click();
    } else {
        alert('Prvo ekstraktuj i šifruj.');
    }
}

function downloadMetadata() {
    if (encryptionIV && encryptionKey && encryptedMetadata) {
        const metadataBlob = new Blob([encryptionIV.toString() + '\n' + encryptedMetadata], { type: 'text/plain' });
        const metadataLink = document.getElementById('downloadLinkMetadata');
        metadataLink.href = URL.createObjectURL(metadataBlob);
        metadataLink.click();
    } else {
        alert('Prvo ekstraktuj i šifruj.');
    }
}

function decryptMetadata() {
    const encryptedMetadataInput = document.getElementById('encryptedMetadataInput');
    const decryptionOutput = document.getElementById('decryptionOutput');

    if (!encryptedMetadataInput.value) {
        alert('Unesi šifrovane podatke.');
        return;
    }

    if (!encryptionKey || !encryptionIV) {
        alert('Prvo ekstraktuj i šifruj.');
        return;
    }

    const inputLines = encryptedMetadataInput.value.split('\n');
    const ivString = inputLines[0];
    const encryptedData = inputLines.slice(1).join('\n');

    //IV to WordArray
    const iv = CryptoJS.enc.Hex.parse(ivString);

    // Dešifrovanje
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey, { iv: iv });
    const decryptedMetadata = decryptedBytes.toString(CryptoJS.enc.Utf8);

    // Prikaz
    decryptionOutput.textContent = decryptedMetadata;
}
