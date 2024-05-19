document.addEventListener("DOMContentLoaded", function() {
    const repoForm = document.getElementById('repo-form');
    const fileList = document.getElementById('file-list');
    let currentPath = '';

    repoForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const repository = document.getElementById('repository').value;
        const branch = document.getElementById('branch').value;

        currentPath = '';
        fetchFiles(username, repository, branch, currentPath);
    });

    function fetchFiles(username, repository, branch, path) {
        const apiUrl = `https://api.github.com/repos/${username}/${repository}/contents/${path}?ref=${branch}`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Not Found') {
                    fileList.innerHTML = 'Repositório não encontrado ou não disponível.';
                    return;
                }
                displayFiles(data, username, repository, branch);
            })
            .catch(error => {
                fileList.innerHTML = 'Erro ao carregar os arquivos.';
                console.error('Erro:', error);
            });
    }

    function displayFiles(files, username, repository, branch) {
        fileList.innerHTML = '';

        if (currentPath !== '') {
            const upLink = document.createElement('a');
            upLink.href = '#';
            upLink.textContent = 'Voltar';
            upLink.addEventListener('click', function(event) {
                event.preventDefault();
                const pathParts = currentPath.split('/').filter(part => part.length > 0);
                pathParts.pop();
                currentPath = pathParts.join('/');
                fetchFiles(username, repository, branch, currentPath);
            });
            fileList.appendChild(upLink);
        }

        files.forEach(file => {
            const itemLink = document.createElement('a');
            itemLink.href = '#';
            itemLink.textContent = file.name;

            if (file.type === 'dir') {
                itemLink.addEventListener('click', function(event) {
                    event.preventDefault();
                    currentPath = `${currentPath}${file.name}/`;
                    fetchFiles(username, repository, branch, currentPath);
                });
            } else {
                itemLink.href = file.download_url;
                itemLink.setAttribute('download', file.name);
            }

            fileList.appendChild(itemLink);
        });
    }
});