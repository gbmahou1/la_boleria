import dotenv from "dotenv";
dotenv.config();
import pg from 'pg';
import joi from "joi";


const { Pool } = pg;


const connection = new Pool({connectionString: process.env.database_url})

async function postCake (req, res){

    try
    {
        const { name, price, description, image } = req.body;
        /*const schema = joi.object({
            image: joi.link().ref().required()
        });*/

        if ( !name || name.length <= 2)
        {
            return res.sendStatus(400)
        };
    
        let existingNames = await connection.query('SELECT FROM cakes WHERE name=$1', [name]);
       
        if (existingNames.rows.length != 0) 
        {
            return res.sendStatus(409);
        }
    
        if ( !price || price <= 0)
        {
            return res.sendStatus(400)
        }

        if ( typeof(description) != "string")
        {
            return res.sendStatus(400)
        }

        /*console.log(image);
        const isLink = schema.validate({image: image});*/

        if ( !image )
        {
            return res.sendStatus(422)
        }

        await connection.query(`
        INSERT INTO
        cakes (name, price, description, image)
        VALUES ($1, $2, $3, $4)`,
        [name, price, description, image]);
    
        res.sendStatus(201);

    }
    catch (error)
    {
        console.log(error)
        res.sendStatus(500)
    }
}

async function getCake (req, res){

    const cakes = await connection.query('SELECT * FROM cakes')

    res.send(cakes.rows)

}

export { postCake, getCake }