const {MongoClient}=require('mongodb')
var client
async function connectToDb(){
   client=new MongoClient(process.env.DB_URI)
   await client.connect()
}

function getCollections(){
    const publicationsCollection=client.db('blog').collection('publications')
    const commentsCollection=client.db('blog').collection('comments')
    return {publicationsCollection,commentsCollection}

}
module.exports={connectToDb,getCollections}