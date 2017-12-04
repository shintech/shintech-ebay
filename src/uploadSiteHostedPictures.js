import got from 'got'
import Handlebars from 'handlebars'
import fs from 'fs'
import path from 'path'
import {parseString} from 'xml2js'

const environment = process.env['NODE_ENV'] || 'development'

const templates = path.join((path.dirname(__dirname)), 'templates')

const ebayEnvironments = {
  development: 'https://api.sandbox.ebay.com/ws/api.dll',
  production: 'https://api.ebay.com/ws/api.dll'
}

const opts = {
  EBAY_API: process.env['EBAY_API'],
  EBAY_APPID: process.env['EBAY_APPID'],
  EBAY_DEVID: process.env['EBAY_DEVID'],
  EBAY_CERTID: process.env['EBAY_CERTID'],
  EBAY_TOKEN: process.env['EBAY_TOKEN'],
  EMAIL: process.env['EMAIL']
}

export default function (name, callback) {
  fs.readFile(path.join(templates, 'uploadSiteHostedPictures.xml'), 'utf-8', (err, src) => {
    if (err) return console.error(err)

    const template = Handlebars.compile(src)
    const output = template({
      image: name,
      opts: opts
    })

    sendXML(output, (err, response) => {
      if (err) return err
      console.log(JSON.stringify(response))
      callback(null, response)
    })
  })
}

function sendXML (body, callback) {
  got.post(ebayEnvironments[environment], {
    method: 'POST',
    body: body,
    headers: getHeaders(opts)
  })
  .then(data => {
    parseXMLResponse(data.body, callback)
  })
  .catch(err => {
    callback(err)
  })
}

function parseXMLResponse (xml, callback) {
  parseString(xml, (err, result) => {
    if (err) return callback(err)
    var response = result
    callback(null, response)
  })
}

function getHeaders (opts) {
  return {
    'Content-Type': 'text/xml',
    'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
    'X-EBAY-API-DEV-NAME': `${opts['EBAY_DEVID']}`,
    'X-EBAY-API-APP-NAME': `${opts['EBAY_APPID']}`,
    'X-EBAY-API-CERT-NAME': `${opts['EBAY_CERTID']}`,
    'X-EBAY-API-SITEID': '0',
    'X-EBAY-API-DETAIL-LEVEL': '0',
    'X-EBAY-API-CALL-NAME': 'UploadSiteHostedPictures'
  }
}
