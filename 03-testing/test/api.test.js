import { describe, before, beforeEach, after, afterEach, it } from 'node:test';
import { deepStrictEqual, ok } from 'node:assert';
import { runSeed } from '../src/db-seed/seed.js';
import { customers } from '../src/db-seed/customers.js';
import { initializeServer } from '../src/index.js';

import CustomerUtil from './util/customer/customerUtil.js';

describe('API Workflow', () => {
    /** @type {import('node:http').Server} _testServer */
    let _testServer = null;

    const customerUtil = new CustomerUtil()

    beforeEach(async () => {
        _testServer = await initializeServer();

        await new Promise((resolve, reject) => _testServer.listen(
            0,
            err => err ? reject(err) : resolve()
        ));
        const { port } = _testServer.address();
        customerUtil.setContextURL(`http://localhost:${port}`);
        await runSeed();
    });

    afterEach(async () => {
        await new Promise(resolve => _testServer.close(resolve))
        customerUtil.setContextURL('')
    });

    describe('POST /customers', () => {

        it('should create customer', async () => {
            const input = {
                name: 'Xuxa da Silva',
                phone: '123456789',
            };

            // Check if customer does not exist before creation
            const { result: customersBefore } = await customerUtil.getCustomers(`?name=${input.name}&phone=${input.phone}`);
            deepStrictEqual(customersBefore.length, 0);

            const expected = { message: `customer ${input.name} created!` };

            const { body, statusCode } = await customerUtil.createCustomer(input);
            ok(body._id)
            deepStrictEqual(body.message, expected.message);
            deepStrictEqual(statusCode, 201);

            // Check if customer exists after creation
            const { result: customersAfter } = await customerUtil.getCustomers(`?name=${input.name}&phone=${input.phone}`);
            deepStrictEqual(customersAfter.length, 1);
            deepStrictEqual(customersAfter[0].name, input.name);
            deepStrictEqual(customersAfter[0].phone, input.phone);
        });

        it.todo('should not create customer with invalid data');
    });

    describe('GET /customers', () => {
        it('should filter customers by name', async () => {
            const { name } = customers.at(0)
            const { statusCode, result } = await customerUtil.getCustomers(`?name=${name}`);
            const { _id, ...output } = result.at(0)
            ok(_id)

            deepStrictEqual(statusCode, 200);
            deepStrictEqual(output, customers.find(customer => customer.name === name));
        });

        it.todo('should filter customers by phone');

        it.todo('should retrieve only initial customers');

        it.todo('given 5 different customers it should have valid list');

    });

    describe('PATCH /customers/:id', () => {
        it.todo('should update customer');
    });

    describe('DELETE /customers/:id', () => {
        it.todo('should delete customer');
    });
});
