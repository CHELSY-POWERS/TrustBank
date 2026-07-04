require('dotenv').config();
const app = require('./app');

// Render automatically defines the PORT environment variable
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
