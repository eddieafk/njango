class View {
    constructor(options = {}) {
        this.httpMethodNames = ["get", "post"];
        Object.assign(this, options);
    }

    static as_view(initOptions = {}) {
        return (req, res) => {
            const instance = new this(initOptions);
            instance.setup(req, res);
            instance.dispatch(req, res);
        };
    }

    setup(req, res) {
        this.req = req;
        this.res = res;

        if (typeof this.get === "function" && typeof this.head !== "function") {
            this.head = this.get;
        }
    }

    dispatch(req, res) {
        const method = req.method.toLowerCase();
        if (this.httpMethodNames.includes(method) && typeof this[method] === "function") {
            return this[method](req, res);
        }
        return this.httpMethodNotAllowed(req, res);
    }

    httpMethodNotAllowed(req, res) {
        res.writeHead(405, { "Allow": this._allowedMethods().join(", ") });
        res.end("405 method not allowed");
    }

    options(req, res) {
        res.writeHead(200, {
            "Allow": this._allowedMethods().join(", "),
            "Content-Length": "0"
        });
        res.end();
    }

    _allowedMethods() {
        return this.httpMethodNames
            .filter(method => typeof this[method] === "function")
            .map(m => m.toUpperCase());
    }
}

const as_view = View.as_view()

export { View, as_view }