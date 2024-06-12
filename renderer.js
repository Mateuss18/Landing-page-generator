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

document.getElementById('add-section').addEventListener('click', () => {
  const rawTitle = document.getElementById('title').value.trim();
  const processedTitle = processTextWithStrongTags(rawTitle);

  const rawContent = document.getElementById('content').value.trim();
  const processedContent = processContent(rawContent);
  
  const imgAlt = document.getElementById('imgAlt').value.trim();

  if (!rawTitle || !rawContent || !imgAlt) {
    document.getElementById('message').textContent = 'Todos os campos são obrigatórios.';
    return;
  }

  sectionCount++;
  document.getElementById('section-count').textContent = `Quantidade de seções adicionadas: ${sectionCount}`;
  document.getElementById('message').textContent = `Seção ${sectionCount} adicionada.`;

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
          <img src="categoria-${sectionCount}.webp" alt="${imgAlt}">
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
    document.getElementById('message').textContent = 'Adicione pelo menos uma seção antes de salvar.';
    return;
  }

  const htmlContent = `
    <section id="categoria">
      ${htmlSections.join('')}
    </section>
  `;

  const result = await window.electron.saveFile(htmlContent);
  if (result.success) {
    document.getElementById('message').textContent = `Arquivo salvo com sucesso: ${result.filePath}`;
  } else {
    document.getElementById('message').textContent = 'O salvamento do arquivo foi cancelado.';
  }
});
