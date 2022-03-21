
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { postCake, getCake } from "./src/controllers/cakeController.js";
import { postClient, getClient, getClientId } from "./src/controllers/clientController.js";
import { postOrder, getOrder, getOrderId } from "./src/controllers/orderController.js";


const app = express();
app.use(express.json());
const port = process.env.PORT;

app.post('/cakes', postCake)
app.get('/cakes', getCake)
app.post('/clients', postClient)
app.get('/clients', getClient)
app.post('/orders', postOrder)
app.get('/orders', getOrder)
app.get('/orders/:id', getOrderId)
app.get('/clients/:id/orders', getClientId)


app.listen(port, () => console.log(`listening at ${port}`))