import got from 'got'
import {parseString} from 'xml2js'
import Handlebars from 'handlebars'
import fs from 'fs'
import path from 'path'

const environment = process.env['NODE_ENV']

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

export default function (raw, callback) {
  fs.readFile(path.join(templates, 'addItems.xml'), 'utf-8', (err, src) => {
    if (err) return console.error(err)
    Handlebars.registerHelper('messageID', (result) => {
      return result['data'].index + 1
    })

    Handlebars.registerHelper('categoryID', (result) => {
      return '13677'
    })

    Handlebars.registerHelper('listingDuration', (result) => {
      return 'Days_3'
    })

    Handlebars.registerHelper('buyItNowPrice', (result) => {
      const products = result['data'].root.products
      const price = parseInt(products[result['data'].key].price)

      return (price + (price * 0.4)).toFixed(2)
    })

    while (raw.length) {
      var products = raw.splice(0, 5)
      const template = Handlebars.compile(src)
      const output = template({
        products: products,
        opts: opts
      })

      sendXML(output, (err, response) => {
        if (err) return callback(err)
        callback(null, response)
      })
    }
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
    var response = result['AddItemsResponse']
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
    'X-EBAY-API-CALL-NAME': 'AddItems'
  }
}
