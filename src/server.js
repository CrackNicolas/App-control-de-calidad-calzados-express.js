import app from './app.js';
import { PORT } from "../config/variables.js";

app.listen(PORT,() => {
    console.log(`Server on port http://localhost:${PORT}`);
});