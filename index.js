const ProxyChain = require('proxy-chain');

const server = new ProxyChain.Server({
    port: 8000,
    verbose: true,
    prepareRequestFunction: ({ request, username, password, hostname, port, isHttp, connectionId }) => {
        return {
            requestAuthentication: false,
            upstreamProxyUrl: `http://Supq:ISJB@localhost:4026`,
        };
    },
});

server.listen(() => {
  console.log(`Proxy server is listening on port ${server.port}`);
});
