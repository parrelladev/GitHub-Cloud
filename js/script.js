document.addEventListener("DOMContentLoaded", function () {
    const repoForm = document.getElementById('repo-form');
    const fileListContainer = document.getElementById('file-list-container');
    const formContainer = document.getElementById('form-container');
    const fileList = document.getElementById('file-list');
    let currentPath = '';

    repoForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const repository = document.getElementById('repository').value;
        const token = document.getElementById('token').value;

        currentPath = '';
        fetchFiles(username, repository, currentPath, token);
        formContainer.style.display = 'none';
        fileListContainer.style.display = 'block';
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
            upLink.textContent = 'Back';
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
            itemLink.textContent = file.name;

            if (file.type === 'dir') {
                itemLink.addEventListener('click', function (event) {
                    event.preventDefault();
                    currentPath = `${currentPath}${file.name}/`;
                    fetchFiles(username, repository, currentPath, token);
                });
            } else {
                itemLink.href = file.download_url;
                itemLink.setAttribute('download', file.name);
            }

            fileList.appendChild(itemLink);
        });
    }

    function displayError(message) {
        fileList.innerHTML = message;
    }
});