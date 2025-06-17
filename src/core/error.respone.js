const statusCode = {
    FORBIDDEN : 403,
    CONFLICT : 409,
    NOTFOUND : 404
}

const ReasonStatusCode = {
    FORBIDDEN : 'Bad Request Error',
    CONFLICT : 'Conflict error',
    NOTFOUND :'Not Found'
}

class ErrorResponse extends Error{
    constructor(message, status){
        super(message)
        this.status = status
    }
}

class ConflictError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, status = statusCode.CONFLICT){
        super(message, status)
    }
}

class NotFoundError extends ErrorResponse {
    constructor(message = ReasonStatusCode.NOTFOUND, status = statusCode.NOTFOUND){
        super(message, status)
    }
}

class ForBiddenError extends ErrorResponse{
     constructor(message = ReasonStatusCode.FORBIDDEN, status = statusCode.FORBIDDEN){
        super(message, status)
    }
}

module.exports = {
    ConflictError,
    NotFoundError,
    ForBiddenError
}