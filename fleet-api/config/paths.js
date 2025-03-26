const path = require('path');

const rootDir = path.resolve(__dirname, '..');

module.exports = {
  rootDir,
  routesDir: path.join(rootDir, 'routes'),
  configDir: path.join(rootDir, 'config'),
}; 