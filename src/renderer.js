let sectionCount = 0;
let htmlSections = [];

// Função para processar texto e converter aspas simples em tags <strong>
function processTextWithStrongTags(text) {
  return text.replace(/'([^']*)'/g, '<strong>$1</strong>');
}

// Função para processar conteúdo de textarea, transformando listas e parágrafos
function processContent(text) {
  const lines = text.split('\n');
  let inList = false;
  let processedContent = '';

  lines.forEach(line => {
    if (line.trim() === '_') {
      if (inList) {
        // Fecha a lista se já está em uma
        processedContent += '</ul>';
        inList = false;
      } else {
        // Abre uma nova lista se não está em uma
        processedContent += '<ul>';
        inList = true;
      }
    } else if (inList) {
      // Adiciona itens de lista enquanto está dentro de uma lista
      if (line.trim().startsWith('-')) {
        processedContent += `<li><b>${line.trim().substring(1).trim()}</b><br></li>`;
      } else {
        processedContent += `<li>${processTextWithStrongTags(line.trim())}</li>`;
      }
    } else if (line.trim().startsWith('-')) {
      // Adiciona linha com <b> e <br> se começa com '-'
      processedContent += `<b>${line.trim().substring(1).trim()}</b><br>`;
    } else if (line.trim() !== '') {
      // Adiciona parágrafos para linhas que não fazem parte de uma lista e não estão vazias
      processedContent += `<p>${processTextWithStrongTags(line.trim())}</p>`;
    }
  });

  // Fecha qualquer lista não fechada
  if (inList) {
    processedContent += '</ul>';
  }

  return processedContent;
}

// Função para mostrar a mensagem temporariamente
function showMessage(message) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
  setTimeout(() => {
    messageElement.textContent = '';
  }, 6000);
}

// Função para resetar as seções
function resetSections() {
  sectionCount = 0;
  htmlSections = [];
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

  if (!rawTitle || !rawContent || !imgAlt ) {
    showMessage('Todos os campos são obrigatórios.');
    return;
  }

  sectionCount++;
  document.getElementById('section-count').textContent = `Quantidade de seções adicionadas: ${sectionCount}`;
  showMessage(`Seção ${sectionCount} adicionada.`);

  const formattedSectionNumber = String(sectionCount).padStart(2, '0');
  const sectionHTML = `
    <div class="conteudo-${formattedSectionNumber} conteudos">
      <div class="flexContainer">
        <div class="conteudo__texto">
          <div class="conteudo__wrapper">
            <h2 class="conteudo__titulo">${processedTitle}</h2>
            ${processedContent}
          </div>
        </div>
        <div class="conteudo__imagem">
          <img src="{{IMAGENS_LAYOUT}}/conteudo-${formattedSectionNumber}.webp" alt="${imgAlt}">
        </div>
      </div>
    </div>
  `;
  htmlSections.push(sectionHTML);

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
      <section id="categoria">
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
      </section>
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
      <section id="categoria">
          ${htmlSections.join('')}
      </section>
  `;

  const result = await window.electron.saveFile(htmlContent);

  if (result.success) {
      showMessage(`Arquivo salvo com sucesso em: ${result.filePath}`);
      resetSections(); // Chama o reset das seções somente após a confirmação de salvamento
  } else {
      showMessage('Ocorreu um erro ao salvar o arquivo.');
  }
});

// Adicionar listener para a mensagem de reset
window.electron.onResetSections(resetSections);
