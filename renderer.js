let sectionCount = 0;
let htmlSections = [];

document.getElementById('add-section').addEventListener('click', () => {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim().split('\n');
    const imgAlt = document.getElementById('imgAlt').value.trim();

    if (!title || !content || !imgAlt) {
        document.getElementById('message').textContent = 'Todos os campos são obrigatórios.';
        return;
    }

    sectionCount++;
    document.getElementById('section-count').textContent = `Quantidade de seções adicionadas: ${sectionCount}`;
    document.getElementById('message').textContent = `Seção ${sectionCount} adicionada.`;

    const sectionHTML = `
    <div class="section">
        <h2>${title}</h2>
        ${content.map(p => `<p>${p}</p>`).join('')}
        <img src="categoria-${sectionCount}.webp" alt="${imgAlt}">
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
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modelo de Categorias</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <section class="categoria">
        ${htmlSections.join('')}
    </section>
</body>
</html>
    `;

    const result = await window.electron.saveFile(htmlContent);
    if (result.success) {
        document.getElementById('message').textContent = `Arquivo salvo com sucesso: ${result.filePath}`;
    } else {
        document.getElementById('message').textContent = 'O salvamento do arquivo foi cancelado.';
    }
});
