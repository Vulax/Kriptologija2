let encryptionKey; // Variable to store the encryption key globally
let encryptionIV; // Variable to store the encryption IV globally
let encryptedMetadata; // Variable to store the encrypted metadata globally

function extractAndEncrypt() {
    const uploadInput = document.getElementById('uploadInput');
    const encryptionSelect = document.getElementById('encryptionSelect');

    if (uploadInput.files.length === 0) {
        alert('Please select an image file.');
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

                // Generate a random 256-bit key
                encryptionKey = CryptoJS.lib.WordArray.random(256 / 8);

                // Generate a random 128-bit IV
                encryptionIV = CryptoJS.lib.WordArray.random(128 / 8);

                // Use the key and IV for encryption
                encryptedMetadata = metadata;
                const encryptionAlgorithm = encryptionSelect.value;
                if (encryptionAlgorithm === 'aes') {
                    encryptedMetadata = CryptoJS.AES.encrypt(metadata, encryptionKey, { iv: encryptionIV }).toString();
                }
                // Add more encryption algorithms as needed

                alert('Metadata extracted and encrypted. You can now download the key and the encrypted metadata.');
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
        alert('Please extract and encrypt metadata before downloading the key.');
    }
}

function downloadMetadata() {
    if (encryptionIV && encryptionKey && encryptedMetadata) {
        const metadataBlob = new Blob([encryptionIV.toString() + '\n' + encryptedMetadata], { type: 'text/plain' });
        const metadataLink = document.getElementById('downloadLinkMetadata');
        metadataLink.href = URL.createObjectURL(metadataBlob);
        metadataLink.click();
    } else {
        alert('Please extract and encrypt metadata before downloading the encrypted metadata.');
    }
}

function decryptMetadata() {
    const encryptedMetadataInput = document.getElementById('encryptedMetadataInput');
    const decryptionOutput = document.getElementById('decryptionOutput');

    if (!encryptedMetadataInput.value) {
        alert('Please enter the encrypted metadata.');
        return;
    }

    if (!encryptionKey || !encryptionIV) {
        alert('Please extract and encrypt metadata before attempting decryption.');
        return;
    }

    const inputLines = encryptedMetadataInput.value.split('\n');
    const ivString = inputLines[0];
    const encryptedData = inputLines.slice(1).join('\n');

    // Convert IV string to WordArray
    const iv = CryptoJS.enc.Hex.parse(ivString);

    // Decrypt using the key and IV
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey, { iv: iv });
    const decryptedMetadata = decryptedBytes.toString(CryptoJS.enc.Utf8);

    // Display the decrypted metadata
    decryptionOutput.textContent = decryptedMetadata;
}
