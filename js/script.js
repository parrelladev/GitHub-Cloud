// Função para salvar os dados de acesso ao repositório em cookies
function saveRepoAccessToCookies(username, repository, token) {
    document.cookie = `username=${encodeURIComponent(username)}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    document.cookie = `repository=${encodeURIComponent(repository)}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    document.cookie = `token=${encodeURIComponent(token)}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
}

// Função para carregar os dados de acesso ao repositório dos cookies
function loadRepoAccessFromCookies() {
    const cookies = document.cookie.split(';');
    let username = '';
    let repository = '';
    let token = '';

    cookies.forEach(cookie => {
        const parts = cookie.split('=');
        const name = parts[0].trim();
        const value = decodeURIComponent(parts[1]);

        if (name === 'username') {
            username = value;
        } else if (name === 'repository') {
            repository = value;
        } else if (name === 'token') {
            token = value;
        }
    });

    return { username, repository, token };
}

// Função para verificar se as credenciais de acesso estão armazenadas em cookies e fazer login
function checkCredentialsAndLogin() {
    const { username, repository, token } = loadRepoAccessFromCookies();

    if (username && repository && token) {
        currentPath = '';
        fetchFiles(username, repository, currentPath, token);
        formContainer.style.display = 'none';
        uploadForm.style.display = 'block';
        fileListContainer.style.display = 'block';
    }
}

// Carregar os dados de acesso ao repositório dos cookies ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    checkCredentialsAndLogin();
});

// Adicionar um evento de envio ao formulário de acesso ao repositório para salvar os dados em cookies e fazer login
repoForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const repository = document.getElementById('repository').value;
    const token = document.getElementById('token').value;

    saveRepoAccessToCookies(username, repository, token);
    checkCredentialsAndLogin();
});