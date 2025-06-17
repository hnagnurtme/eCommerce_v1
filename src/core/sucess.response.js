const statusCode = {
   OK : 200,
   CREATED : 201,
   DELETE : 204,
}

const ReasonStatusCode = {
  OK : 'SUCCESS',
  CREATED : 'CREATED'
}

class SuccessResponse {
    constructor({ 
        message = "SUCCESS", 
        statusCode = statusCode.OK, 
        reasonStatusCode = ReasonStatusCode.OK, 
        metadata = {} 
    }) {
        this.message = message;
        this.statusCode = statusCode;
        this.reasonStatusCode = reasonStatusCode;
        this.metadata = metadata;
    }

    send(res, header = {}) {

        for (let key in header) {
            res.setHeader(key, header[key]);
        }
        return res.status(this.statusCode).json(this);
    }
}

class OK extends SuccessResponse {
    constructor({ message, metadata }) {
        super({
            message,
            metadata,
            statusCode: statusCode.OK,
            reasonStatusCode: ReasonStatusCode.OK
        });
    }
}

class CREATED extends SuccessResponse {
    constructor({ message, metadata }) {
        super({
            message,
            metadata,
            statusCode: statusCode.CREATED,
            reasonStatusCode: ReasonStatusCode.CREATED
        });
    }
}

module.exports = {
    OK,
    CREATED
}
