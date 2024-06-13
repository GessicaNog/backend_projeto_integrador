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

async function findAll(collection) {
    const db = await connect();
    return db.collection(collection).find().toArray();

}

async function insert(collection, arq) {
    const db = await connect();
    return db.collection(collection).insertOne(arq);
}


async function findOne(collection,id) {
    const db = await connect();
    return db.collection(collection).findOne({ _id: ObjectId.createFromHexString(id) });
}


async function update(id, arq) {
    const db = await connect();
    return db.collection(COLLECTION).updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: arq });
}

async function deleteOne(collection,id){
    const db = await connect();
    return db.collection(collection).deleteOne({ _id: ObjectId.createFromHexString(id)});

}

const db = { findAll, insert, findOne, update, deleteOne };
export default db;