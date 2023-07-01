const http = require("http");
const url = require("url");

const server = http.createServer();

let validUserCredentials = {
    "user1": "password1",
    // Add more users as needed
};

function authenticate(username, password) {
    return validUserCredentials[username] && validUserCredentials[username] === password;
}

function getUsernameAndPasswordFromAuthorizationHeader(authorizationHeader) {
    if (authorizationHeader === undefined) {
        return {username: "none", password: "none"};
    }
    const authTypeAndBase64 = authorizationHeader.split(" ");
    const base64 = authTypeAndBase64[1];
    const usernameAndPassword = Buffer.from(base64, "base64").toString("utf8");
    const [username, password] = usernameAndPassword.split(":");
    return { username, password };
}

// Define the target proxy port and its credentials
const proxyPort = 4026;
const proxyCredentials = {
    username: "Supq",
    password: "ISJB"
};

server.on("request", (clientReq, clientRes) => {
    console.log("HTTP request received");
    const { username, password } = getUsernameAndPasswordFromAuthorizationHeader(clientReq.headers["proxy-authorization"]);

    if (!authenticate(username, password)) {
        clientRes.writeHead(407, { "Proxy-Authenticate": "Basic" });
        clientRes.end("Proxy authentication required");
        return;
    }

    const requestOptions = {
        hostname: "51.178.43.147",
        port: proxyPort,
        path: clientReq.url,
        method: clientReq.method,
        headers: {
            ...clientReq.headers,
            "Proxy-Authorization": "Basic " + Buffer.from(`${proxyCredentials.username}:${proxyCredentials.password}`).toString("base64"),
        },
    };

    const proxyReq = http.request(requestOptions, (proxyRes) => {
        clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(clientRes);
    });

    clientReq.pipe(proxyReq);

    proxyReq.on("error", (err) => {
        console.log("Proxy to server error");
        console.log(err);
    });

    clientReq.on("error", (err) => {
        console.log("Client to proxy error");
        console.log(err);
    });

    clientReq.on("close", () => {
        //console.log("HTTP client disconnected");
    });

    clientRes.on("error", (err) => {
        console.error("Error on clientRes:", err);
    });
});

server.on("connect", (clientReq, clientSocket, head) => {
    console.log("HTTPS request received");
    const { username, password } = getUsernameAndPasswordFromAuthorizationHeader(clientReq.headers["proxy-authorization"]);

    if (!authenticate(username, password)) {
        clientSocket.write("HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic\r\n\r\n");
        clientSocket.end();
        return;
    }

    const { port, hostname } = url.parse(`//${clientReq.url}`, false, true);
    const requestOptions = {
        host: "51.178.43.147",
        port: proxyPort,
        path: `${hostname}:${port}`,
        method: "CONNECT",
        headers: {
            ...clientReq.headers,
            "Proxy-Authorization": "Basic " + Buffer.from(`${proxyCredentials.username}:${proxyCredentials.password}`).toString("base64"),
        },
    };

    const proxyReq = http.request(requestOptions);

    proxyReq.on("connect", (proxyRes, proxySocket) => {
        clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
        proxySocket.pipe(clientSocket);
        clientSocket.pipe(proxySocket);
    });

    proxyReq.on("error", (err) => {
        console.log("Proxy to server error");
        console.log(err);
    });

    clientSocket.on("close", () => {
        //console.log("HTTPS client disconnected");
    });

    clientSocket.on("error", (err) => {
        console.error("Error on clientSocket:", err);
    });

    proxyReq.end();
});

server.on("error", (err) => {
    console.log("Some internal server error occurred");
    console.log(err);
});

server.on("close", () => {
    //console.log("Client disconnected");
});

server.listen(
    {
        host: "0.0.0.0",
        port: 7000,
    },
    () => {
        console.log("Server listening on 0.0.0.0:7000");
    }
);
