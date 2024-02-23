# Validation & Contract Testing Example

This repository can be used to start with validation and contract-testing based on OpenAPI.
As sample API, we use the Swagger Petstore API.

## Validation

TBD

## Contract Testing

For contract testing, we use the tools Portman and Newman.
We just use them via `npx`, so you don't have to install them and only need `npm`.

Portman takes an OpenAPI file and generates a Postman collection out of it including tests.
With the standard configuration, contract tests are generated for each operation testing that
- the HTTP call was successful
- the response has the correct content type, JSON body and schema
- if any specified headers are present

Further tests and configurations can be added by modifying the configuration file.

Newman is the command-line runner from Postman and runs the tests in the generated Postman collection.

### Execution

Execute the command to run the contract tests in your terminal in the root folder of the repository:
```
npx portman --local openapi.yaml --output postmanCollection.json --portmanConfigFile portman-test-config.json`
```

`openapi.yaml` is the name of the OpenAPI file, `postmanCollection.json` is the name of the generated postman collection and `portman-test-config.json` is the name of the configuration file for the tests. 

Run the contract test in your terminal in the same folder by passing the name of the generated postman collection:
```
npx newman run postmanCollection.json --verbose
```

I always recommend to use the `--verbose` option because I find it helpful to identify the problems if the tests don't pass.
If you want to, you can try it without later to compare and make your own decision.
