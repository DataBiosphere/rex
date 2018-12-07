const express = require('express')
const fetch = require('node-fetch')
const cors = require('cors')
const bodyParser = require('body-parser')
const validate = require('validate.js')
const Datastore = require('@google-cloud/datastore')
const { Response, promiseHandler } = require('./utils')
const { samRoot } = require('../config')

validate.validators.string = value => {
  if (validate.isDefined(value) && !validate.isString(value)) {
    return 'must be a string'
  }
}

const npsConstraints = {
  score: {
    numericality: { greaterThanOrEqualTo: 0, lessThanOrEqualTo: 10, noStrings: true, onlyInteger: true }
  },
  reasonComment: { string: true, length: { maximum: 10000 } },
  changeComment: { string: true, length: { maximum: 10000 } }
}

const datastore = new Datastore()

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use('/docs', express.static('docs'))

app.get('/status', async (req, res) => {
  res.sendStatus(200)
})

const validateUser = async req => {
  const authRes = await fetch(
    `${samRoot}/register/user/v2/self/info`,
    { headers: { authorization: req.headers.authorization } }
  ).catch(() => {
    throw new Response(503, 'Unable to contact auth service')
  })
  if (authRes.status === 401) {
    throw new Response(401, 'Unauthorized')
  }
  if (!authRes.ok) {
    console.error('Sam error', await authRes.text())
    throw new Response(503, 'Failed to query auth service')
  }
  const { enabled, userEmail } = await authRes.json()
  if (!enabled) {
    throw new Response(403, 'Forbidden')
  }
  return userEmail
}

/**
 * @api {post} /api/npsResponses/create Create an NPS response
 * @apiName createNpsResponse
 * @apiVersion 1.0.0
 * @apiGroup Surveys
 * @apiParam {Number=0-10} [score] NPS score
 * @apiParam {String} [reasonComment] Answer to 'What was the reason for this score?'
 * @apiParam {String} [changeComment] Answer to 'What could we change?'
 * @apiSuccess (Success 201) body none
 */
app.post('/api/npsResponses/create', promiseHandler(async req => {
  const email = await validateUser(req)
  const data = validate.cleanAttributes(req.body, npsConstraints)
  const errors = validate(data, npsConstraints, { fullMessages: false })
  if (errors) {
    throw new Response(400, errors)
  }
  await datastore.save({
    key: datastore.key('NpsResponse'),
    data: { ...data, email, timestamp: new Date() }
  })
  return new Response(201)
}))

/**
 * @api {get} /api/npsResponses/lastTimestamp Get last NPS response timestamp
 * @apiName lastNpsTimestamp
 * @apiVersion 1.0.0
 * @apiGroup Surveys
 * @apiSuccess (Success 200) timestamp Timestamp of most recent response, or omitted if none
 */
app.get('/api/npsResponses/lastTimestamp', promiseHandler(async req => {
  const email = await validateUser(req)
  const query = datastore.createQuery('NpsResponse')
    .filter('email', email)
    .order('timestamp', { descending: true })
    .limit(1)
  const [entities] = await datastore.runQuery(query)
  return new Response(200, { timestamp: entities[0] && entities[0].timestamp })
}))

app.listen(process.env.PORT || 8080)
