const mongoose = require("mongoose");
require("dotenv").config();
let { enums } = require("../utility");
require("../model/users");

let connection;
require("saslprep");

let dbprodoptions = {
    auth: {
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};

let dbdevoptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}

const dbconnect = () => {
    let uri = process.env.PROD == "1" ? process.env.DB_PROD_URI : process.env.DB_DEV_URI
    let options = process.env.PROD == "1" ? dbprodoptions : dbdevoptions
    mongoose.connect(uri, options);
    connection = mongoose.connection;
    connection.on("error", err => {
        console.log("error", enums.TS_DATABASE_CONNECTION_FAILED);
    });
    connection.once("open", () => {
        console.log("info", enums.TS_DATABASE_CONNECTION_SUCCESS);
    });
}



class mongoQuery {

    getDb(schema) {
        return new Promise((resolve, reject) => {
            let modelSchema;
            if (connection != null) {
                modelSchema = require(`../model/${schema}`);
                return resolve(modelSchema);
            } else {
                let uri = process.env.PROD == "1" ? process.env.DB_PROD_URI : process.env.DB_DEV_URI
                let options = process.env.PROD == "1" ? dbprodoptions : dbdevoptions
                mongoose.connect(uri, options);
                connection = mongoose.connection;
                connection.on("error", err => {
                    console.log("error", enums.TS_DATABASE_CONNECTION_FAILED);
                    return reject(err);
                });
                connection.once("open", () => {
                    console.log("info", enums.TS_DATABASE_CONNECTION_SUCCESS);
                    modelSchema = require(`../model/${schema}`);
                    return resolve(modelSchema);
                });
            }
        });
    }

    findOne(collectionName="", query={}, projection={}, populate="",option={}) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    collection.findOne(query, projection,option).populate(populate).exec((err, result) => {
                        if (err) return reject(err);
                        return resolve(result);
                    });
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }

    getIndexes(collectionName="") {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    collection.collection.getIndexes({full: true},(err,result)=>{
                        if (err) return reject(err);
                        return resolve(result);
                    })
                })
                .catch(err => {
                    console.log(err)
                    return reject(err);
                });
        });
    }

    find(collectionName = "", query = {}, projection = {}, populate = "", option = {}) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    let searchResult = {};
                    let records = collection.find(query, projection);
                    records.count().exec((err, counts) => {
                        if (err) return reject(err);
                        searchResult.totalRecords = counts;
                        if (counts === 0) {
                            searchResult.records = [];
                            return resolve(searchResult);
                        }
                        collection.find(query, projection, option)
                            .populate(populate)
                            .exec(function(err, result) {
                                if (err) return reject(err);
                                searchResult.records = result;
                                return resolve(searchResult);
                            });
                    });
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }


    aggregatePagination(collectionName, query, populate, options) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(async collection => {
                    let searchResult = {};
                    let records = await collection.aggregate(query);
                    searchResult.totalRecords = records.length;
                    if (records.length === 0) {
                        searchResult.records = [];
                        return resolve(searchResult);
                    }
                    query = [...query, ...options]
                    collection.aggregate(query).exec((err, result) => {
                        if (err) return reject(err);
                        collection.populate(result, { path: populate }, (error, res) => {
                            if (err) return reject(error);
                            searchResult.records = res
                            return resolve(searchResult);
                        })
                    });
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }


    findBySearch(collectionName, where, equal) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    collection
                        .find()
                        .where(where)
                        .equals(new RegExp("^" + equal, "i"))
                        .exec((err, result) => {
                            if (err) return reject(err);
                            return resolve(result);
                        });
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }

    findCount(collectionName, query) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    collection.count(query).exec((err, result) => {
                        if (err) return reject(err);
                        return resolve(result);
                    });
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }

    aggregate(collectionName, query, populate) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    collection.aggregate(query).exec((err, result) => {
                        if (err) return reject(err);
                        collection.populate(result, { path: populate }, (error, res) => {
                            if (err) return reject(error);
                            return resolve(res);
                        })
                    });
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }

    save(collectionName, data) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    let newModel = new collection(data);
                    newModel.save((err, saved) => {
                        if (err) return reject(err);
                        return resolve(saved);
                    });
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }

    findOneAndUpdate(collectionName, query, update, option) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    collection.findOneAndUpdate(query, update, option, (err, result) => {
                        if (err) return reject(err);
                        return resolve(result);
                    });
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }

    findAndUpdateMany(collectionName, query, update, option) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    collection.updateMany(query, update, option, (err, result) => {
                        if (err) return reject(err);
                        return resolve(result);
                    });
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }

    //deleteOne function
    deleteOne(collectionName, query) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    collection.deleteOne(query)
                        .then(searchResult => {
                            return resolve(searchResult);
                        })
                        .catch(err => {
                            return reject(err)
                        })
                }).catch(err => {
                    return reject(err)
                })
        })
    }

    //deleteMany function
    deleteMany(collectionName, query) {
        return new Promise((resolve, reject) => {
            this.getDb(collectionName)
                .then(collection => {
                    collection.deleteMany(query)
                        .then(searchResult => {
                            return resolve(searchResult);
                        })
                        .catch(err => {
                            return reject(err)
                        })
                }).catch(err => {
                    return reject(err)
                })
        })
    }
}

module.exports = {
    dbconnect,
    mongoQuery
}