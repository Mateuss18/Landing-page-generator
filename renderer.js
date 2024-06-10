let sectionCount = 0;
let htmlSections = [];

// Função para processar texto e converter aspas simples em tags <strong>
function processTextWithStrongTags(text) {
  return text.replace(/'([^']*)'/g, '<strong>$1</strong>');
}

document.getElementById('add-section').addEventListener('click', () => {
  const rawTitle = document.getElementById('title').value.trim();
  const processedTitle = processTextWithStrongTags(rawTitle);

  const rawContent = document.getElementById('content').value.trim();
  // Dividir o conteúdo em parágrafos com base em uma ou mais linhas em branco
  const processedContent = rawContent.split(/\n\s*\n/).map(line => processTextWithStrongTags(line));

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
            ${processedContent.map(p => `<p>${p}</p>`).join('')}
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
