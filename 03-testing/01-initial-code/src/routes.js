
import { once } from 'events';
import { logger, reply } from './util.js';

const setupRoutes = ({ customers }) => {
    return {
        'GET /customers': async (req, res) => {

            const { query } = req;

            const data = await customers
                .find(query)
                .sort({ name: 1 })
                .toArray();

            return reply(res, { data });
        },
        'POST /customers': async (req, res) => {
            const data = JSON.parse(await once(req, 'data'));
            const { insertedId } = await customers.insertOne(data);
            logger.info(`${data.name} inserted at ${new Date().toISOString()}`)

            return reply(res, { code: 201, data: { message: `customer ${data.name} created!`, _id: insertedId } });
        },

    };
};


export {
    setupRoutes
}