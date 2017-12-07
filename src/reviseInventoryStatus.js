import Handlebars from 'handlebars'
import fs from 'fs'
import path from 'path'
import sendXML from './sendXML'

const templates = path.join((path.dirname(__dirname)), 'templates')

const opts = {
  EBAY_API: process.env['EBAY_API'],
  EBAY_APPID: process.env['EBAY_APPID'],
  EBAY_DEVID: process.env['EBAY_DEVID'],
  EBAY_CERTID: process.env['EBAY_CERTID'],
  EBAY_TOKEN: process.env['EBAY_TOKEN'],
  EMAIL: process.env['EMAIL']
}

export default function (raw, callback) {
  fs.readFile(path.join(templates, 'reviseInventoryStatus.xml'), 'utf-8', (err, src) => {
    if (err) return callback(err)

    const template = Handlebars.compile(src)
    const output = template({
      products: JSON.parse(raw),
      opts: opts
    })

    sendXML(output, 'ReviseInventoryStatus', (err, response) => {
      if (err) return callback(err)
      callback(null, response)
    })
  })
}
