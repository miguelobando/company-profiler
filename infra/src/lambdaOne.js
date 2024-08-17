exports.handler = async (event) => {
    console.log("Lambda One invoked", event);
    return { statusCode: 200, body: JSON.stringify('Lambda One completed') };
  };