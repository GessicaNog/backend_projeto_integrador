import { MongoClient, ObjectId } from "mongodb";

let singleton;

async function connect() {
    if (singleton) return singleton;

    const client = new MongoClient(process.env.MONGO_HOST);
    await client.connect();
    console.log('conectado ao servidor');

    singleton = client.db(process.env.MONGO_DATABASE);
    return singleton;
}

const COLLECTION = 'arq';

async function findAll() {
    const db = await connect();
    return db.collection(COLLECTION).find().toArray();

}

async function insert(arq) {
    const db = await connect();
    return db.collection(COLLECTION).insertOne(arq);
}


async function findOne(id) {
    const db = await connect();
    return db.collection(COLLECTION).findOne({ _id: ObjectId.createFromHexString(id) });
}


async function update(id, arq) {
    const db = await connect();
    return db.collection(COLLECTION).updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: arq });
}

async function deleteOne(id){
    const db = await connect();
    return db.collection(COLLECTION).deleteOne({ _id: ObjectId.createFromHexString(id)});

}

const db = { findAll, insert, findOne, update, deleteOne };
export default db;