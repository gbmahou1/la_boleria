import dotenv from "dotenv";
dotenv.config();
import pg from 'pg';
import dayjs from "dayjs";

const { Pool } = pg;


const connection = new Pool({connectionString: process.env.database_url})

async function postOrder (req, res)
{
    const { clientId, cakeId, quantity, totalPrice } = req.body;

    const createdAt = dayjs().format('YYYY-MM-DD')
    console.log(createdAt)

    const clientExists = await connection.query('SELECT * FROM clients WHERE id=$1', [clientId]);

    if ( clientExists.rows.length == 0)
    {
        return res.sendStatus(404)
    }

    const cakeExists = await connection.query('SELECT * FROM cakes WHERE id=$1', [cakeId]);

    if ( cakeExists.rows.length == 0)
    {
        return res.sendStatus(404)
    }

    console.log(typeof(quantity))
    if ( !quantity || quantity > 4 || quantity < 1 )
    {
        return res.sendStatus(400)
    }

    await connection.query(`
    INSERT INTO
    orders ("clientId", "cakeId", quantity, "totalPrice", "createdAt")
    VALUES ($1, $2, $3, $4, $5)`,
    [clientId, cakeId, quantity, totalPrice, createdAt]);

    res.sendStatus(201);
}

async function getOrder (req, res)
{
    try
    {
        const date = req.query.date;

        let orders

        let validate = dayjs(date, 'YYYY-MM-DD').isValid()
        console.log(validate)

        if ( date )
        {
            orders = await connection.query({
                text: `
                SELECT
                    orders.*,
                    clients.id as "clientId",
                    clients.name as "clientName",
                    clients.address,
                    clients.phone,
                    cakes.id as "cakeId",
                    cakes.name as "cakeName",
                    cakes.price,
                    cakes.description,
                    cakes.image
                FROM orders
                    JOIN clients ON orders."clientId" = clients.id
                    JOIN cakes ON orders."cakeId" = cakes.id
                WHERE orders."createdAt" = $1
                `,
                rowMode: 'array'
            },[date]);
        }
        else
        {
            orders = await connection.query({
                text: `
                SELECT
                    orders.*,
                    clients.id as "clientId",
                    clients.name as "clientName",
                    clients.address,
                    clients.phone,
                    cakes.id as "cakeId",
                    cakes.name as "cakeName",
                    cakes.price,
                    cakes.description,
                    cakes.image
                FROM orders
                    JOIN clients ON orders."clientId" = clients.id
                    JOIN cakes ON orders."cakeId" = cakes.id
                `,
                rowMode: 'array'
            });
        }
        

        res.send(orders.rows.map(row => {
            const [clientId, clientName, address, phone, cakeId, cakeName, price, description, image, createdAt, quantity, totalPrice] = row;

            return {
                client: {
                    id: clientId,
                    name: clientName,
                    address: address,
                    phone: phone
                },
                cake: {
                    id: cakeId,
                    name: cakeName,
                    price: price,
                    description: description,
                    image: image
                },
                createdAt, quantity, totalPrice
            }

        }));
        
        console.log(orders.rows.length)
        
        if (orders.rows.length == 0)
        {
            res.sendStatus(404)
        }
        else
        {
            res.sendStatus(200)
        }

    }
    catch (error)
    {
        console.log(error)
        res.sendStatus(500)
    }
}

async function getOrderId (req, res)
{

    let id = req.params.id

    if ( !id || parseInt(id)<0 )
    {
        return res.sendStatus(400)
    }

    let orders = await connection.query({
        text: `
        SELECT
            orders.*,
            clients.id as "clientId",
            clients.name as "clientName",
            clients.address,
            clients.phone,
            cakes.id as "cakeId",
            cakes.name as "cakeName",
            cakes.price,
            cakes.description,
            cakes.image
        FROM orders
            JOIN clients ON orders."clientId" = clients.id
            JOIN cakes ON orders."cakeId" = cakes.id
        WHERE orders.id = $1
        `,
        rowMode: 'array'
    }, [id]);



    res.send(orders.rows.map(row => {
        const [clientId, clientName, address, phone, cakeId, cakeName, price, description, image, createdAt, quantity, totalPrice] = row;

        return {
            client: {
                id: clientId,
                name: clientName,
                address: address,
                phone: phone
            },
            cake: {
                id: cakeId,
                name: cakeName,
                price: price,
                description: description,
                image: image
            },
            createdAt, quantity, totalPrice
        }

    }));

    if (orders.rows.length === 0)
    {
        return res.sendStatus(404)
    }

    return res.sendStatus(200)

}

export { postOrder, getOrder, getOrderId }