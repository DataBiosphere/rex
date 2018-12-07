class Response {
  constructor(status, data) {
    this.status = status
    this.data = data
  }
}

const promiseHandler = fn => (req, res) => {
  const handleValue = value => {
    if (value instanceof Response) {
      res.status(value.status).send(value.data)
    } else {
      res.status(500).send(value.toString())
    }
  }
  return fn(req, res).then(handleValue, handleValue)
}

module.exports = {
  Response,
  promiseHandler
}
