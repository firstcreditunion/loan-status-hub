# Make an API call

You can use your [Access Token](/docs/build-an-integration/learn-more/authentication#access-tokens) to make your first call to our REST API. Here's a sample code snippet that you can run in your terminal to fetch a list of all the admins in your workspace:

```shell
# Copy the cURL request below into your Terminal.
# Replace **<INSERT_ACCESS_TOKEN_HERE>** with your Access Token.

$ curl https://api.intercom.io/admins \
-H 'Authorization:Bearer <INSERT_ACCESS_TOKEN_HERE>' \
-H 'Accept: application/json'
```

Alternatively, you can make the same API call directly from our API reference [documentation](https://developers.intercom.com/intercom-api-reference/reference/listadmins).

We also have Postman collections that are auto generated from our [OpenAPI specification](https://github.com/intercom/Intercom-OpenAPI) for the following Intercom API versions: [2.7](https://www.postman.com/intercom-api/workspace/intercom-apis/collection/25988804-16ffcbaf-0951-4c08-985b-578e61c82dfa?ctx=documentation), [2.8](https://www.postman.com/intercom-api/workspace/intercom-apis/collection/25988804-acd836d7-6572-46af-9fd5-310f8092485e?ctx=documentation) and [Unstable](https://www.postman.com/intercom-api/workspace/intercom-apis/collection/25988804-edbb87f2-db76-4b7f-93b8-edec7a719bd4?ctx=documentation).
