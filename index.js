const ProxyChain = require('proxy-chain');

const server = new ProxyChain.Server({
    port: 8000,
    verbose: true,
    prepareRequestFunction: ({ request, username, password, hostname, port, isHttp, connectionId }) => {
        const proxyAuthValue = Buffer.from('Supq:ISJB').toString('base64');
        return {
            requestAuthentication: false,
            headers: {
                'Proxy-Authorization': `Basic ${proxyAuthValue}`
            },
            upstreamProxyUrl: 'http://localhost:4026',
        };
    },
});

server.listen(() => {
  console.log(`Proxy server is listening on port ${server.port}`);
});
