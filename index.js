const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a4va6wy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        const servicesCollection = client
            .db("autoService")
            .collection("services");
        const bookingsCollection = client
            .db("autoService")
            .collection("bookings");

        // !get data from serviceCollection
        app.get("/services", async (req, res) => {
            const result = await servicesCollection.find().toArray();
            res.send(result);
        });
        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const options = {
                projection: {
                    _id: 1,
                    title: 1,
                    service_id: 1,
                    img: 1,
                    price: 1,
                },
            };

            const result = await servicesCollection.findOne(query, options);
            res.send(result);
        });

        // !get data from bookingCollection
        app.get("/bookings", async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email };
            }
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        // ! post data in bookingsCollection
        app.post("/bookings", async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });

        // ! update booking
        app.patch("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                  status: updatedBooking.status
                },
              };
            // console.log(updatedBooking);
            const result = await bookingsCollection.updateOne(filter, updateDoc)
            res.send(result)
        });

        // ! delete booking
        app.delete("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);
        });

        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("server is open !!");
});

app.listen(port, () => {
    console.log(`server is running at port ${port}`);
});
