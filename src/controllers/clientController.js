import dotenv from "dotenv";
dotenv.config();
import pg from 'pg';

const { Pool } = pg;


const connection = new Pool({connectionString: process.env.database_url})

async function postClient (req, res){

    try
    {
        const { name, address, phone }  = req.body;

        if ( !name )
        {
            return res.sendStatus(400)
        }
        if ( !address )
        {
            return res.sendStatus(400)
        }
        if ( !phone || typeof(phone) != "string" || phone.length > 11 || phone.length < 10 )
        {
            return res.sendStatus(400)
        }

        await connection.query(`
        INSERT INTO
        clients (name, address, phone)
        VALUES ($1, $2, $3)`,
        [name, address, phone]);
    
        res.sendStatus(201);
    }
    catch (error)
    {
        console.log(error)
        res.sendStatus(500)
    }

}

async function getClient (req, res){

    try
    {
        const clients = await connection.query('SELECT * FROM clients')

        res.send(clients.rows)

    }
    catch (error)
    {
        console.log(error)
        res.sendStatus(500)
    }
}

async function getClientId (req, res){

    try
    {
        const id = req.params.id;

        const orders = await connection.query('SELECT * FROM orders WHERE "clientId" = $1', [id])

        if ( orders.rows.length === 0)
        {
            return res.status(404).send([])
        }

        res.send(orders.rows)

    }
    catch (error)
    {
        console.log(error)
        res.sendStatus(500)
    }
}

export { postClient, getClient, getClientId }