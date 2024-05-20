// Evento de load
$(document).ready(function () {
    let currentPath = "";

    const $repoForm = $('#repo-form');
    const $repoInfoElement = $('#repo-info');
    const $fileListContainer = $('#file-list-container');
    const $fileList = $('#file-list');
    const $homeLink = $('#home-link');

    $('#icone-dark-mode').on('click', function () {
        document.body.classList.toggle('light-mode');
    });

    // Evento atualizar/Tela inicial
    $('#home-link').on('click', function (event) {
        window.location.reload();
    });

    // Evento Submit do formulario
    $('#repo-form').on('submit', function (event) {
        const username = $('#username').val();
        const repository = $('#repository').val();
        const token = $('#token').val();

        const userData = {
            username: username,
            repository: repository,
            token: token,
            currentPath: ''
        };

        localStorage.setItem('userData', JSON.stringify(userData))

        fetchFiles(userData.username, userData.repository, userData.currentPath, userData.token);
        $('#file-list-container').css('display', 'block');
        $('#repo-form').hide();
    });

    $('#switch').on('click', function (event) {
        $('#file-list').html(''); // Limpa lista de arquivos
        $('#repo-form').show();

        updateLocalStorage({
            username: '', repository: '',
            token: '',
            currentPath: ''
        })
    });

    const userData = JSON.parse(localStorage.getItem("userData"));

    if (userData !== null && userData !== undefined) {
        fetchFiles(userData.username, userData.repository, userData.currentPath, userData.token);
        $repoInfoElement.html(`${userData.username}/${userData.repository}`);
    }
});

function updateLocalStorage(...args) {
    // Obter o objeto JSON armazenado no localStorage
    let obj = JSON.parse(localStorage.getItem('userData')) || {};

    // Iterar sobre todos os argumentos
    for (let arg of args) {
        if (typeof arg !== null) {
            // Iterar sobre as chaves do objeto
            for (let key in arg) {
                // Atualizar a chave correspondente no objeto resultante
                obj[key] = arg[key];
            }
        }
    }

    // Salvar o objeto atualizado de volta no localStorage
    localStorage.setItem('userData', JSON.stringify(obj));

    return obj;
}


function fetchFiles(username, repository, path, token) {
    const apiUrl = `https://api.github.com/repos/${username}/${repository}/contents/${path}?ref=main`;
    let headers = {};

    if (token !== null && token !== undefined && token !== '') {
        headers = {
            'Authorization': `token ${token}`
        };
    }

    fetch(apiUrl, { headers })
        .then(response => {
            if (!response.ok) {
                $('#repo-form').show();
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'Not Found') {
                console.error('Error:', error);
                $('#repo-form').show();
                return;
            }

            displayFiles(data, username, repository, path, token);
            updateLocalStorage({ currentPath: path })
            $('#repo-form').hide();
        })
        .catch(error => {
            console.error('Error:', error);
            $('#repo-form').show();
        });
}

function displayFiles(files, username, repository, path, token) {
    $('#file-list').html(''); // Limpa lista de arquivos

    if (path !== '') {
        const upLink = document.createElement('a');
        upLink.href = '#';
        upLink.innerHTML = '<i class="bi bi-arrow-return-left"></i>';
        upLink.addEventListener('click', function (event) {
            event.preventDefault();
            const pathParts = path.split('/').filter(part => part.length > 0);
            pathParts.pop();

            localStorage.setItem()
            newPath = pathParts.join('/');
            fetchFiles(username, repository, newPath, token);
        });
        $('#file-list').append(upLink);
    }

    const fetchedDirectories = [];
    const fetchedFiles = [];

    files.forEach(file => {
        if (file.type === 'dir') {
            fetchedDirectories.push({
                type: 'dir',
                name: file.name,
                icon: getIconForFileType('dir')
            });
        } else {
            fetchedFiles.push({
                type: 'file',
                name: file.name,
                extension: file.name.split('.').pop().toLowerCase(),
                icon: getIconForFileType(file.name.split('.').pop().toLowerCase()),
                download_url: file.download_url
            });
        }
    });

    fetchedDirectories.forEach(dir => {
        const dirItem = document.createElement('a');
        dirItem.href = '#';
        dirItem.innerHTML = `<span class="${dir.icon}"></span> ${dir.name}`;
        dirItem.addEventListener('click', function (event) {
            event.preventDefault();
            newPath = `${path}${dir.name}/`;
            fetchFiles(username, repository, newPath, token);
        });
        $('#file-list').append(dirItem);
    });

    fetchedFiles.sort((a, b) => {
        if (a.type === 'file' && b.type === 'dir') return -1;
        if (a.type === 'dir' && b.type === 'file') return 1;
        return a.name.localeCompare(b.name);
    }).forEach(file => {
        const fileItem = document.createElement('a');
        fileItem.href = '#';
        fileItem.innerHTML = `<span class="${file.icon}"></span> ${file.name}`;
        fileItem.addEventListener('click', function (event) {
            event.preventDefault();
            downloadFile(file.download_url, file.name);
        });
        $('#file-list').append(fileItem);
    });
}

function getIconForFileType(fileType) {
    switch (fileType) {
        case 'exe':
            return 'bi bi-filetype-exe'
        case 'dir':
            return 'bi bi-folder-fill';
        case 'txt':
            return 'bi bi-file-earmark-text';
        case 'pdf':
            return 'bi bi-file-pdf-fill';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'ico':
            return 'bi bi-image';
        case 'aac':
            return 'bi bi-file-music-fill';
        case 'ai':
            return 'bi bi-file-ai-fill';
        case 'bmp':
            return 'bi bi-file-image-fill';
        case 'cs':
            return 'bi bi-file-code-fill';
        case 'css':
            return 'bi bi-file-code-fill';
        case 'csv':
            return 'bi bi-file-spreadsheet-fill';
        case 'doc':
        case 'docx':
            return 'bi bi-file-word-fill';
        case 'exe':
            return 'bi bi-file-excel-fill';
        case 'gif':
            return 'bi bi-file-image-fill';
        case 'heic':
            return 'bi bi-file-image-fill';
        case 'html':
            return 'bi bi-file-code-fill';
        case 'java':
            return 'bi bi-file-code-fill';
        case 'jpg':
            return 'bi bi-file-image-fill';
        case 'js':
            return 'bi bi-file-code-fill';
        case 'json':
            return 'bi bi-file-code-fill';
        case 'jsx':
            return 'bi bi-file-code-fill';
        case 'key':
            return 'bi bi-file-locked-fill';
        case 'm4p':
            return 'bi bi-file-music-fill';
        case 'md':
        case 'mdx':
            return 'bi bi-file-text-fill';
        case 'mov':
            return 'bi bi-file-play-fill';
        case 'mp3':
            return 'bi bi-file-music-fill';
        case 'mp4':
            return 'bi bi-file-play-fill';
        case 'otf':
            return 'bi bi-file-font-fill';
        case 'php':
            return 'bi bi-file-code-fill';
        case 'png':
            return 'bi bi-file-image-fill';
        case 'ppt':
        case 'pptx':
            return 'bi bi-file-presentation-fill';
        case 'psd':
            return 'bi bi-file-photoshop-fill';
        case 'py':
            return 'bi bi-file-code-fill';
        case 'raw':
            return 'bi bi-file-earmark-arrow-down-fill';
        case 'rb':
            return 'bi bi-file-code-fill';
        case 'sass':
            return 'bi bi-file-code-fill';
        case 'scss':
            return 'bi bi-file-code-fill';
        case 'sh':
            return 'bi bi-file-code-fill';
        case 'sql':
            return 'bi bi-file-code-fill';
        case 'svg':
            return 'bi bi-file-image-fill';
        case 'tiff':
            return 'bi bi-file-image-fill';
        case 'tsx':
            return 'bi bi-file-code-fill';
        case 'ttf':
            return 'bi bi-file-font-fill';
        case 'txt':
            return 'bi bi-file-text-fill';
        case 'wav':
            return 'bi bi-file-music-fill';
        case 'woff':
            return 'bi bi-file-font-fill';
        case 'xls':
        case 'xlsx':
            return 'bi bi-file-excel-fill';
        case 'xml':
            return 'bi bi-file-code-fill';
        case 'yml':
            return 'bi bi-file-code-fill';
        case 'mov':
        case 'mp4':
        case 'wmv':
        case 'avi':
        case 'mkv':
        case 'flv':
        case 'webm':
        case 'm4v':
        case '3gp':
        case 'mpg':
        case 'mpeg':
            return 'bi bi-film';
        // Adicione outros tipos de arquivo conforme necessário
        default:
            return 'bi bi-file-earmark';
    }
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


