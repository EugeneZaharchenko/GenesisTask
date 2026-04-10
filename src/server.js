require('dotenv').config();

const app = require('./app');
const { startScanner } = require('./services/scannerService');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

startScanner();
