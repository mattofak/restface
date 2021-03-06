"use strict";

/*
 * General HTTP request routing / interface
 *
 * Dispatches a request to
 * - A matching front-end handler, or
 * - A back-end handler iff
 *   - there is no front-end match
 *   - the request would map to the front-end handler making the request.
 */

function Verbs (route, env, frontEndRouter, backEndRouter) {
    this.route = route;
    this.env = env;
    this.frontEndRouter = frontEndRouter;
    this.backEndRouter = backEndRouter;
}

Verbs.prototype.request = function* request (req) {
    var frontEndMatch = this.frontEndRouter.match(req.uri),
        handler, res;
    if (!frontEndMatch || frontEndMatch.route === this.route) {
        // No front-end handler, or matches the same route.
        // Point to backend.
        //console.log('trying backend for', req.uri);
        var backendMatch = this.backEndRouter.match(req.uri);
        if (!backendMatch) {
            return {
                status: 404,
            };
        }
        handler = backendMatch.route.methods[req.method]
                    || backendMatch.route.methods.all;
    } else {
        // call the frount-end route
        handler = frontEndMatch.route.methods[req.method]
                    || frontEndMatch.route.methods.all ;
        if (!handler) {
            throw new Error('No handler found for ' + req.method + ' ' + req.uri);
        }
        if (this.route === null) {
            this.route = frontEndMatch.route;
        }
    }
    res = yield* handler.handler(this, req);
    return res;
};

// Generic parameter massaging:
// * If last parameter is an object, it is expected to be the request object.
// * If the first parameter is a string, it's expected to be the URL.
// * If the second parameter is a String or Buffer, it's expected to be a
//   resource body.
function makeRequest (args, method) {
    var argPos = args.length - 1,
        lastArg = args[argPos],
        req = {};
    if (lastArg && lastArg.constructor === Object) {
        req = lastArg;
        argPos--;
    }
    switch (argPos) {
    case 1: req.body = args[argPos]; argPos--;
            /* falls through */
    case 0: req.uri = args[argPos]; break;
    case -1: break;
    default: throw new Error('Invalid arguments supplied to Verb');
    }
    req.method = method;
    return req;
}

Verbs.prototype.GET = function* GET (uri, req) {
    return yield* this.request(makeRequest(arguments, 'get'));
};

Verbs.prototype.POST = function* POST (uri, req) {
    return yield* this.request(makeRequest(arguments, 'put'));
};

Verbs.prototype.PUT = function* PUT (uri, req) {
    return yield* this.request(makeRequest(arguments, 'put'));
};

Verbs.prototype.DELETE = function* DELETE (uri, req) {
    return yield* this.request(makeRequest(arguments, 'put'));
};

Verbs.prototype.HEAD = function* HEAD (uri, req) {
    return yield* this.request(makeRequest(arguments, 'head'));
};

Verbs.prototype.OPTIONS = function* OPTIONS (uri, req) {
    return yield* this.request(makeRequest(arguments, 'options'));
};

Verbs.prototype.TRACE = function* TRACE (uri, req) {
    return yield* this.request(makeRequest(arguments, 'trace'));
};

Verbs.prototype.CONNECT = function* CONNECT (uri, req) {
    return yield* this.request(makeRequest(arguments, 'connect'));
};

Verbs.prototype.COPY = function* COPY (uri, req) {
    return yield* this.request(makeRequest(arguments, 'copy'));
};

Verbs.prototype.MOVE = function* MOVE (uri, req) {
    return yield* this.request(makeRequest(arguments, 'move'));
};

Verbs.prototype.PURGE = function* PURGE (uri, req) {
    return yield* this.request(makeRequest(arguments, 'purge'));
};

module.exports = Verbs;
