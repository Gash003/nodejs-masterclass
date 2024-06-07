import http from 'http';
import { getDb } from './db.js';
import { parse } from 'url';
import { isTestEnv } from './util.js'
/**
* @typedef {Object} ResponseDataStore
* @property {http.IncomingMessage} response - The incoming HTTP response object.
* @property {string} url - The URL associated with the response.
*/


import { setupRoutes } from './routes.js';
import { logger, reply } from './util.js';


async function initializeServer() {

    if (!isTestEnv && !process.env.DB_NAME) {
        logger.error(red('[error*****]: please, pass DB_NAME env before running it!'));
        process.exit(1);
    }

    const { dbClient, collections: { customers } } = await getDb();

    const handleRequest = (request, response) => {

        const routes = setupRoutes({ customers })

        const parsedUrl = parse(request.url, true);
        let routeKey = `${request.method} ${parsedUrl.pathname}`;
        request.query = parsedUrl.query

        return (async () => {

            if (!routes[routeKey]) {
                reply(response, { code: 404, data: { error: 'Not Found' } });
                return
            }
            await dbClient.connect()
            await routes[routeKey](request, response);
        })()

    };

    const server = http.createServer(handleRequest);

    server.on('close', async () => {
        // log('server closed!');
        await dbClient.close();
    });

    return server
}

if (!isTestEnv) {
    const server = await initializeServer()
    const PORT = process.env.PORT || 9999;
    server.listen(PORT, '::', () => {
        logger.info(green(`server is running at http://localhost:${PORT}`));
    });
}

export { initializeServer };


