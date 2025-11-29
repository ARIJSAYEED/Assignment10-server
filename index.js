const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// middlewars
app.use(cors());
app.use(express.json());

// mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://a10:fr0ZOkXaxyrlSVL3@cluster0.taazt4c.mongodb.net/?appName=Cluster0";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // creating database and collections 
        const database = client.db("a10");
        const productsCollection = database.collection("products");
        const importedProducts = database.collection('imports');

        // product,all product, product details related api

        // insert the exported product into productCollection
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product)
            res.send(result);
        })

        app.get('/products', async (req, res) => {
            const products = await productsCollection.find().toArray();
            res.send(products);
        });

        app.get('/productDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query)
            res.send(result)
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/latestProducts', async (req, res) => {
            const cursor = productsCollection.find().sort({ created_at: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result)
        })

        // export related apis 
        app.get('/myexports', async (req, res) => {
            const email = req.query.email;
            // console.log('the email is',email);
            const query = { email: email };
            console.log(query);
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        // import related apis
        app.post('/myimports', async (req, res) => {
            const imports = req.body;
            const result = await importedProducts.insertOne(imports)
            res.send(result)
        })

        app.get('/myimports',async(req,res)=>{
            const cursor = importedProducts.find();
            const result = await cursor.toArray();
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`backend is running on this port no-${port}`);
})