// 01-api-repl.mjs
// curl -i "localhost:9999?salary=2000&discount=15a"

import http from 'node:http'
import { parse } from 'node:url'
function netSalary({ discount, salary }) {
    const percent = (discount / 100)
    const cost = salary * percent
    const result = salary - cost

    return result
}

http.createServer((req, res) => {
    const { query } = parse(req.url, true)
    const result = netSalary(query)
    debugger
    res.end(`Your monthly salary is: ${result}`)
})
    .listen(9999, () => console.log('app running at 9999'))