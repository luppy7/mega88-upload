
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultContainer = document.getElementById('resultContainer');
const resultUrl = document.getElementById('resultUrl');
const copyBtn = document.getElementById('copyBtn');
const uploadMoreBtn = document.getElementById('uploadMoreBtn');

browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFile);

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) uploadFile(files[0]);
});

// ============== FUNGSI PENDEKKAN LINK ==============
async function shortenUrl(longUrl) {
  try {
    const response = await fetch('https://spoo.me/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=${encodeURIComponent(longUrl)}`
    });
    const data = await response.json();
    return data.short_url || longUrl;
  } catch (error) {
    console.error('Shorten error:', error);
    return longUrl;
  }
}

function handleFile(e) {
  const file = e.target.files[0];
  if (file) uploadFile(file);
  fileInput.value = '';
}

async function uploadFile(file) {
  resultContainer.style.display = 'none';
  progressContainer.style.display = 'flex';
  progressFill.style.width = '0%';
  progressText.textContent = '0%';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
      }
    });

    xhr.addEventListener('load', async () => {
      progressContainer.style.display = 'none';
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.status) {
          const longUrl = response.data.url;
          // ===== PENDEKKAN LINK SECARA AUTOMATIK =====
          const shortUrl = await shortenUrl(longUrl);
          resultUrl.value = shortUrl;
          resultContainer.style.display = 'block';
          navigator.clipboard?.writeText(shortUrl);
        } else {
          alert(`Ralat: ${response.message}`);
        }
      } else {
        alert(`Ralat: ${xhr.status} - ${xhr.statusText}`);
      }
    });

    xhr.addEventListener('error', () => {
      progressContainer.style.display = 'none';
      alert('Ralat rangkaian. Sila cuba lagi.');
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  } catch (error) {
    progressContainer.style.display = 'none';
    alert(`Ralat: ${error.message}`);
  }
}

// ============== COPY ==============
copyBtn.addEventListener('click', () => {
  resultUrl.select();
  navigator.clipboard?.writeText(resultUrl.value);
  copyBtn.textContent = '✅ Copied!';
  setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
});

uploadMoreBtn.addEventListener('click', () => {
  resultContainer.style.display = 'none';
  fileInput.click();
});
