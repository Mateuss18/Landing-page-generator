let sectionCount = 0;
let htmlSections = [];
let sectionImages = [];

function processTextWithStrongTags(text) {
  return text.replace(/'([^']*)'/g, '<strong>$1</strong>');
}

function processContent(text) {
  const lines = text.split('\n');
  let inList = false;
  let processedContent = '';

  lines.forEach(line => {
    if (line.trim() === '_') {
      if (inList) {
        processedContent += '</ul>';
        inList = false;
      } else {
        processedContent += '<ul>';
        inList = true;
      }
    } else if (inList) {
      if (line.trim().startsWith('-')) {
        processedContent += `<li><b>${line.trim().substring(1).trim()}</b></li>`;
      } else {
        processedContent += `<li>${processTextWithStrongTags(line.trim())}</li>`;
      }
    } else if (line.trim().startsWith('-')) {
      processedContent += `<b>${line.trim().substring(1).trim()}</b>`;
    } else if (line.trim() !== '') {
      processedContent += `<p>${processTextWithStrongTags(line.trim())}</p>`;
    }
  });

  if (inList) {
    processedContent += '</ul>';
  }

  return processedContent;
}

function showMessage(message) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
  setTimeout(() => {
    messageElement.textContent = '';
  }, 6000);
}

function resetSections() {
  sectionCount = 0;
  htmlSections = [];
  sectionImages = [];
  document.getElementById('section-count').textContent = 'Quantidade de seções adicionadas: 0';
  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  document.getElementById('imgAlt').value = '';
  document.getElementById('imgFile').value = '';
  showMessage('Seções resetadas.');
}

document.getElementById('add-section').addEventListener('click', () => {
  const rawTitle = document.getElementById('title').value.trim();
  const processedTitle = processTextWithStrongTags(rawTitle);

  const rawContent = document.getElementById('content').value.trim();
  const processedContent = processContent(rawContent);
  
  const imgAlt = document.getElementById('imgAlt').value.trim();
  const imgFile = document.getElementById('imgFile').files[0];

  if (!rawTitle || !rawContent || !imgAlt || !imgFile) {
    showMessage('Todos os campos são obrigatórios.');
    return;
  }

  sectionCount++;
  const formattedSectionNumber = String(sectionCount).padStart(2, '0');
  const newImageName = `conteudo-${formattedSectionNumber}${imgFile.name.slice(imgFile.name.lastIndexOf('.'))}`;
  const newImageNameWebp = `conteudo-${formattedSectionNumber}.webp`;

  document.getElementById('section-count').textContent = `Quantidade de seções adicionadas: ${sectionCount}`;
  showMessage(`Seção ${sectionCount} adicionada.`);

  const sectionHTML = `
    <section class="conteudo-${formattedSectionNumber} conteudos">
      <div class="flexContainer">
        <div class="container">
          <div class="conteudo__texto">
            <div class="conteudo__wrapper">
              <h2 class="conteudo__titulo">${processedTitle}</h2>
              ${processedContent}
            </div>
          </div>

          <div class="conteudo__imagem">
            <img src="{{IMAGENS_LAYOUT}}/${newImageNameWebp}" alt="${imgAlt}" loading="lazy">
          </div>
        </div>
      </div>
    </section>
  `;
  htmlSections.push(sectionHTML);

  sectionImages.push({
    filePath: imgFile.path,
    newName: newImageName
  });

  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  document.getElementById('imgAlt').value = '';
  document.getElementById('imgFile').value = '';
});

document.getElementById('preview-file').addEventListener('click', () => {
  const rawTitle = document.getElementById('title').value.trim();
  const rawContent = document.getElementById('content').value.trim();
  const rawImgAlt = document.getElementById('imgAlt').value.trim();
  const imgFile = document.getElementById('imgFile').files[0];

  if (!rawTitle || !rawContent || !rawImgAlt || !imgFile) {
    showMessage('Preencha os campos antes de visualizar o preview.');
    return;
  }

  const processedTitle = processTextWithStrongTags(rawTitle);
  const processedContent = processContent(rawContent);
  const processedImgAlt = processContent(rawImgAlt);

  const reader = new FileReader();
  reader.onload = function () {
    const base64Image = reader.result;
    const htmlContent = `
      <div id="categoria-movilife">
        <div class="conteudos">
          <div class="flexContainer">
            <div class="conteudo__texto">
              <div class="conteudo__wrapper">
                <h2 class="conteudo__titulo">${processedTitle}</h2>
                ${processedContent}
              </div>
            </div>
            <div class="conteudo__imagem">
              <img src="${base64Image}" alt="${processedImgAlt}">
              <div style="color: black; position: absolute; background: white; bottom: 0" class="preview-alt">${processedImgAlt}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    window.electron.previewFile(htmlContent);
  };
  reader.readAsDataURL(imgFile);
});

document.getElementById('save-file').addEventListener('click', async () => {
  if (sectionCount === 0) {
    showMessage('Adicione pelo menos uma seção antes de salvar.');
    return;
  }

  const htmlContent = `
    <div id="categoria-movilife">
      ${htmlSections.join('')}
    </div>
  `;

  const result = await window.electron.saveFile(htmlContent, sectionImages);

  if (result.success) {
    showMessage(`Arquivo salvo com sucesso em: ${result.filePath}`);
    resetSections();
  } else {
    showMessage('Ocorreu um erro ao salvar o arquivo.');
  }
});


window.electron.onResetSections(resetSections);
