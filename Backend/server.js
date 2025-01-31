import  dotenv  from "dotenv";
dotenv.config({
        path:'./.env'
});

import http from "http";

import connectDB from "./src/db/DB.js";
import {app} from "./app.js";


connectDB()
.then(() => {
        const server = http.createServer(app);
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
        });
}).catch((error) => {
        console.log("Mongo DB connection failed: ", error);
        process.exit(1);
});