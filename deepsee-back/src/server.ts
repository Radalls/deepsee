import app from './app';
import { connectToDatabase } from './middlewares/database';

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => { await connectToDatabase(); });
