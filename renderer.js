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

document.getElementById('add-section').addEventListener('click', () => {
  const rawTitle = document.getElementById('title').value.trim();
  const processedTitle = processTextWithStrongTags(rawTitle);

  const rawContent = document.getElementById('content').value.trim();
  const processedContent = processContent(rawContent);
  
  const imgAlt = document.getElementById('imgAlt').value.trim();

  if (!rawTitle || !rawContent || !imgAlt) {
    showMessage('Todos os campos são obrigatórios.');
    return;
  }

  sectionCount++;
  document.getElementById('section-count').textContent = `Quantidade de seções adicionadas: ${sectionCount}`;
  showMessage(`Seção ${sectionCount} adicionada.`);

  const sectionHTML = `
    <div class="conteudo-${sectionCount} conteudos">
      <div class="flexContainer">
        <div class="conteudo__texto">
          <div class="conteudo__wrapper">
            <h2 class="conteudo__titulo">${processedTitle}</h2>
            ${processedContent}
          </div>
        </div>

        <div class="conteudo__imagem">
          <img src="{{IMAGENS_LAYOUT}}/conteudo-${sectionCount}.webp" alt="${imgAlt}">
        </div>
      </div>
    </div>
  `;
  htmlSections.push(sectionHTML);

  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  document.getElementById('imgAlt').value = '';
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
    showMessage(`Arquivo salvo em: ${result.filePath}`);
    // Redefinir sectionCount e htmlSections após salvar
    sectionCount = 0;
    htmlSections = [];
    document.getElementById('section-count').textContent = 'Quantidade de seções adicionadas: 0';
  } else {
    showMessage('O salvamento do arquivo foi cancelado.');
  }
});
