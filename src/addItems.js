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

      sendXML(output, 'AddItems', (err, response) => {
        if (err) return callback(err)
        callback(null, response)
      })
    }
  })
}
