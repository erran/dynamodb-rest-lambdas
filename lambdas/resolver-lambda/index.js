const AWS = require('aws-sdk');
const dynamodbClient = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

function getEpochSeconds() {
  return Math.floor(new Date() / 1000);
}


const MIN_AGE = 13;
const addPlayer = ({age, name, username}, callback) => {
  // Example of validation and handling an error.
  if (age < MIN_AGE) {
    callback(`Unable to add player ${name} (@${username}) must be at least ${MIN_AGE} to sign up.`)
    return;
  }

  // The aws-sdk DynamoDB client returns a promise which will be complete asynchronously.
  const playerPromise = dynamodbClient.putItem({
    TableName: 'Player',
    Item: {
      JoinedAt: { N: `${getEpochSeconds()}` },
      PlayerAge: { N: age },
      PlayerId: { S: username },
      PlayerName: { S: name }
    },
  }).promise();

  // When the promise is resolved call callback.
  return playerPromise.then(_ => callback(null, {age, name, username}));
};

/**
 * Handles requests to this lambda based on the field we want to resolve.
 *
 * event: The request body.
 *     field: The field to resolve.
 *     arguments: Arguments to pass to the resolver function.
 * context: not frequently used inside of lambdas.
 * callback: A function(ERROR, RESPONSE) to call with the result of the lambda.
 *     ERROR: The error message string to return.
 *     RESPONSE: The response object which will be converted to JSON.
 */
exports.handler = (event, context, callback) => {
  switch (event.field) {
    case "addPlayer":
      addPlayer(event.arguments, callback);
      break;
    default:
      callback(`Unable to resolve field: ${event.field}`, null);
      break;
  }
};
