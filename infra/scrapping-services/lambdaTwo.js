exports.handler = async (event) => {
    console.log("Lambda two invoked", event);
    return { statusCode: 200, body: JSON.stringify('Lambda two completed') };
  };