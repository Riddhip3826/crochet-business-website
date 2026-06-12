const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace standard endpoints pattern
code = code.replace(/app\.([a-z]+)\('([^']+)',\s*\(req, res\)\s*=>/g, "app.$1('$2', async (req, res) =>");
code = code.replace(/getAuthUser\(/g, 'await getAuthUser(');

// Also fix `const getAuthUser = async (req: express.Request) =>` which got renamed to `const await getAuthUser = ...`
code = code.replace(/const await getAuthUser/g, 'const getAuthUser');

fs.writeFileSync('server.ts', code);
