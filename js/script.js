document.addEventListener("DOMContentLoaded", function () {
    const repoForm = document.getElementById('repo-form');
    const uploadForm = document.getElementById('upload-form');
    const fileListContainer = document.getElementById('file-list-container');
    const formContainer = document.getElementById('form-container');
    const fileList = document.getElementById('file-list');
    const homeLink = document.getElementById('home-link');
    const recentReposLink = document.getElementById('recent-repos-link');
    const logoutLink = document.getElementById('logout-link');
    let currentPath = '';

    repoForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const repository = document.getElementById('repository').value;
        const token = document.getElementById('token').value;

        currentPath = '';
        fetchFiles(username, repository, currentPath, token);
        formContainer.style.display = 'none';
        uploadForm.style.display = 'block';
        fileListContainer.style.display = 'block';
    });

    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const repository = document.getElementById('repository').value;
        const token = document.getElementById('token').value;
        const files = document.getElementById('file-upload').files;

        uploadFiles(username, repository, currentPath, files, token);
    });

    homeLink.addEventListener('click', function (event) {
        event.preventDefault();
        window.location.reload();
    });    

    recentReposLink.addEventListener('click', function (event) {
        event.preventDefault();
        // Lógica para mostrar repositórios recentes
    });

    logoutLink.addEventListener('click', function (event) {
        event.preventDefault();
        // Lógica para fazer logout
    });

    function fetchFiles(username, repository, path, token) {
        const apiUrl = `https://api.github.com/repos/${username}/${repository}/contents/${path}?ref=main`;

        const headers = token ? {
            'Authorization': `token ${token}`
        } : {};

        fetch(apiUrl, { headers })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.message === 'Not Found') {
                    displayError('Repository Not Found or Not Available 😔<br><a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" target="_blank">Create your access token</a>.');
                    return;
                }
                displayFiles(data, username, repository, path, token);
            })
            .catch(error => {
                displayError('Repository Not Found or Not Available 😔<br><a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" target="_blank">Create your access token</a>.');
                console.error('Error:', error);
            });
    }

    function displayFiles(files, username, repository, path, token) {
        fileList.innerHTML = '';
    
        if (currentPath !== '') {
            const upLink = document.createElement('a');
            upLink.href = '#';
            upLink.textContent = '🔙 Back';
            upLink.addEventListener('click', function (event) {
                event.preventDefault();
                const pathParts = currentPath.split('/').filter(part => part.length > 0);
                pathParts.pop();
                currentPath = pathParts.join('/');
                fetchFiles(username, repository, currentPath, token);
            });
            fileList.appendChild(upLink);
        }
    
        files.forEach(file => {
            const itemLink = document.createElement('a');
            itemLink.href = '#';
    
            if (file.type === 'dir') {
                itemLink.textContent = `📂 ${file.name}`;
                itemLink.addEventListener('click', function (event) {
                    event.preventDefault();
                    currentPath = `${currentPath}${file.name}/`;
                    fetchFiles(username, repository, currentPath, token);
                });
            } else {
                itemLink.textContent = `📄 ${file.name}`;
                itemLink.addEventListener('click', function (event) {
                    event.preventDefault();
                    downloadFile(file.download_url, file.name);
                });
            }
    
            fileList.appendChild(itemLink);
        });
    }
    
    function downloadFile(url, filename) {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => console.error('Error downloading file:', error));
    }
    

    function uploadFiles(username, repository, path, files, token) {
        const apiUrl = `https://api.github.com/repos/${username}/${repository}/contents/${path}`;

        const headers = {
            'Authorization': `token ${token}`
        };

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const content = event.target.result;
                const formData = new FormData();
                formData.append('content', content);
                formData.append('message', `Upload ${file.name}`);
                formData.append('branch', 'main');

                fetch(apiUrl, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        message: `Upload ${file.name}`,
                        content: btoa(content),
                        branch: 'main'
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Upload successful:', data);
                    fetchFiles(username, repository, currentPath, token);
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                });
            };
            reader.readAsText(file);
        });
    }
});

// Função para salvar os dados de acesso ao repositório em cookies e redirecionar para a página principal
function saveRepoAccessAndRedirect(username, repository, token) {
    document.cookie = `username=${encodeURIComponent(username)}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    document.cookie = `repository=${encodeURIComponent(repository)}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    document.cookie = `token=${encodeURIComponent(token)}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;

    currentPath = '';
    fetchFiles(username, repository, currentPath, token);
    formContainer.style.display = 'none';
    uploadForm.style.display = 'block';
    fileListContainer.style.display = 'block';
}

// Carregar os dados de acesso ao repositório dos cookies ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    const { username, repository, token } = loadRepoAccessFromCookies();

    if (username && repository && token) {
        saveRepoAccessAndRedirect(username, repository, token);
    }
});

// Adicionar um evento de envio ao formulário de acesso ao repositório para salvar os dados em cookies e redirecionar para a página principal
repoForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const repository = document.getElementById('repository').value;
    const token = document.getElementById('token').value;

    saveRepoAccessAndRedirect(username, repository, token);
});
