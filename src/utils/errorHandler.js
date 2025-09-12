class errorHandler extends Error{
    constructor(message = "Something is wrong",statusCode, stack = "", errors = []){
        super(message)
        this.statusCode = statusCode
        this.errors = errors
        this.success = false
        this.message = message
        this.data = null
        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {errorHandler}