// ... (imports, connectDB, express setup, same as before)
const express = require('express');
const cors = require('cors');
const connectDB = require('./config');
const authRoutes = require('./routes/auth'); 

const app = express();
connectDB();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ... (authRoutes setup, same as before)
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
