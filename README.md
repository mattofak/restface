RESTFace
========

REST API interface proxy prototype

Middleware interface
====================

Handlers register per path:

```javascript
rf.addHandler('/users', { 
    // Handler for incoming requests
    onRequest: requestHandler,
    // Handler for returned backend requests
    onResponse: responseHandler
});
```

Handlers are expected to return requests and/or responses:

```javascript
// Simple request handler
onRequest( env ) {
    // Rewrite the URI to the backend
	env.req.uri = '/pages' + env.req.uri;
    return { reqs: [env.req] };
}

onResponse( env, req, resp ) {
    if (env.req === req) {
        // response to the original request
        if (resp.status === 404) {
            // try to generate HTML on the fly
            var env.parsoidRequest = { uri: '/parsoid' + env.req.uri };
            return { reqs: env.parsoidRequest };
        } else {
            return { resp: resp };
        }
    } else if (req === env.parsoidRequest) {
        // handle the response from Parsoid
        if (resp.status === 200) {
            return { 
                // Asynchronously save back the HTML
                reqs: [{
                        method: 'PUT',
                        uri: '/pages' + env.req.uri
                      }],
                // And return the HTML to the client
                resp: resp
            };
        } else {
            // return error
            return { resp: resp };
        }
    }
}
```