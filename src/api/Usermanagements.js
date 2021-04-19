const schema = require("../../config/schemas");
const { enums, constants } = require("../utility");
const mongoQ = new (require("../dataprovider")).mongoQuery()

class Usermanagements {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    async create() {
        let response = {}
        try {
            let body = this.req.body;
            mongoQ.findOne(schema.TS_USER,{userName:body.userName,email:body.email},{},"",{}).then(user => {
                if (user) {
                    response.status = constants.TS_FAILED;
                        response.statusCode = constants.TS_CONFLICTS_CODE;
                        response.message = enums.TS_ALREADY_EXIST;
                        response.error = ""
                        return this.res.status(response.statusCode).json(response);
                } else {
                    mongoQ.save(schema.TS_USER,body).then(newuser=>{
                        response.status = constants.TS_SUCCESS;
                        response.statusCode = constants.TS_RESOURCE_CREATED_CODE;
                        response.message = enums.TS_REGISTERED_SUCCESS;
                        return this.res.status(response.statusCode).json(response);
                    }).catch(error => {
                return this.handleUnExpectationError(error, response, this.res)
            })
                    
                }
            }).catch(error => {
                return this.handleUnExpectationError(error, response, this.res)
            })
        } catch (error) {
            return this.handleUnExpectationError(error, response, this.res)
        }
    }

    async search() {
        let response = {}
        try {
            let body = this.req.body;
            mongoQ.findBySearch(schema.TS_USER,body.key,body.value).then(data => {
                response.status = constants.TS_SUCCESS;
                response.statusCode = constants.TS_RESOURCE_CREATED_CODE;
                response.data = data;
                return this.res.status(response.statusCode).json(response);
            }).catch(error => {
                return this.handleUnExpectationError(error, response, this.res)
            })
        } catch (error) {
            return this.handleUnExpectationError(error, response, this.res)
        }
    }

    async getIndex() {
        let response = {}
        try {
            mongoQ.getIndexes(schema.TS_USER).then(data => {
                response.status = constants.TS_SUCCESS;
                response.statusCode = constants.TS_RESOURCE_CREATED_CODE;
                response.data = data;
                return this.res.status(response.statusCode).json(response);
            }).catch(error => {
                return this.handleUnExpectationError(error, response, this.res)
            })
        } catch (error) {
            return this.handleUnExpectationError(error, response, this.res)
        }
    }

    async handleUnExpectationError(error, response, res) {
        response.status = constants.TS_FAILED;
        response.statusCode = constants.TS_SERVER_ERROR_CODE;
        response.message = enums.TS_SERVER_ERROR;
        response.error = error
        return res.status(response.statusCode).json(response);
    }
}

module.exports = Usermanagements