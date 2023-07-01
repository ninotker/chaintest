const axios = require('axios');

axios.get('http://example.com', {
    proxy: {
        host: 'localhost',
        port: 4026,
        auth: {
            username: 'Supq',
            password: 'ISJB'
        }
    }
}).then(response => {
    console.log(response.data);
}).catch(error => {
    console.error(error);
});
