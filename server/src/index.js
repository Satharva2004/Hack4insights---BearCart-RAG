// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from "./db/index.js";
import {app} from './app.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve .env path relative to the server root (one level up from src)
const envPath = join(__dirname, '..', '.env');
dotenv.config({
    path: envPath
})

// Check if MONGODB_URL is set
if (!process.env.MONGODB_URL) {
    console.error('❌ MONGODB_URL is not set in environment variables!');
    console.error(`   Looking for .env file at: ${envPath}`);
    console.error('   Please create a .env file in the server directory with MONGODB_URL');
    process.exit(1);
}


connectDB()
.then(() => {
    app.listen(process.env.SERVER_PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.SERVER_PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
