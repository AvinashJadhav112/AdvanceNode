const mongoose =require('mongoose')
const redis =require("redis")
const util =require('util')

const redisUrl='redis://127.0.0.1:6379'
const client=redis.createClient(redisUrl)
client.hget =util.promisify(client.hget)
const exec= mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache= function(options={}){
    this.useCache= true;
    this.hashKey=JSON.stringify(options.key || '')
    return this;
}

mongoose.Query.prototype.exec=async function(){
    // console.log("I am about to run a query");
    // console.log(this.getQuery())
if(!this.useCache){
    return exec.apply(this,arguments);
}

    const key=Object.assign({},this.getQuery(),{
        collection: this.mongooseCollection.name
    })
    // console.log(key)

    //see if we have a value for 'key' in redis
    const cacheValue= await client.hget(this.hashKey,key)

    //if we  do, return it, otherwise run the normal flow of getting data from MongoDB and then caching it
if(cacheValue){
    // console.log(cacheValue)
    const doc=JSON.parse(cacheValue);
    return Array.isArray(doc)?doc.map(d=>new this.model(d))
    :new this.model(doc)
}

    //otherwise, issue the query and store the result in redis
    const result=await exec.apply(this,arguments)
    client.set(key,JSON.stringify(result),'EX',10)
    return result
}

module.exports={
    clearHash(hashKey){
        client.retryDelay(JSON.stringify(hashKey))
    }
}