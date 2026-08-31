class ApiResponse {
    constructor(statusCode, message = "Success", data) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;

        if (data !== undefined) {
            if (typeof message === "string") {
                this.message = message;
                this.data = data;
            } else {
                this.message = typeof data === "string" ? data : "Success";
                this.data = message;
            }
        } else if (typeof message === "string") {
            this.message = message;
            this.data = null;
        } else {
            this.message = "Success";
            this.data = message;
        }
    }
}

export { ApiResponse };

