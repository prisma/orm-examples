exports.handler = async (event, context, callback) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ up: true }),
  }
}
