import sendXML from './sendXML'
import xml2js from 'xml2js'
import _ from 'lodash'

const opts = {
  EBAY_API: process.env['EBAY_API'],
  EBAY_APPID: process.env['EBAY_APPID'],
  EBAY_DEVID: process.env['EBAY_DEVID'],
  EBAY_CERTID: process.env['EBAY_CERTID'],
  EBAY_TOKEN: process.env['EBAY_TOKEN'],
  EMAIL: process.env['EMAIL']
}

var builder = new xml2js.Builder({
  pretty: true,
  headless: true
})

export default async function (raw, callback) {
  while (raw.length) {
    let products = await configProducts(raw.splice(0, 5))
    let xml = await configXML(products)
    let response = await sendXML(xml, 'AddItems')
    callback(null, response)
  }
}

function configXML (products) {
  return new Promise(function (resolve, reject) {
    var template = _.template(`
<?xml version="1.0" encoding="utf-8" ?>
<AddItemsRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken><%- opts.EBAY_TOKEN %></eBayAuthToken>
  </RequesterCredentials>
  <Version>967</Version>
  <ErrorLanguage>en_US</ErrorLanguage>
  <WarningLevel>Low</WarningLevel>
  <% _.forEach(products, function(product) { %><%= product %>\n<%  }) %>
</AddItemsRequest>
`)
    var obj = {
      template: template({products: products.processed, opts: opts}),
      numbers: products.numbers
    }
    resolve(obj)
  })
}

function configProducts (products) {
  var retval = []
  var arr = []
  return new Promise(function (resolve, reject) {
    products.forEach((product, v) => {
      arr.push(product.number)

      var processed = {
        AddItemRequestContainer: {
          MessageID: v + 1,
          Item: {
            Title: product.description,
            Description: product.longDescription,
            PrimaryCategory: {
              CategoryID: '13677'
            },
            CategoryMappingAllowed: true,
            Site: 'US',
            Quantity: product.quantity,
            StartPrice: product.price,
            ListingDuration: 'Days_3',
            DispatchTimeMax: 3,
            ShippingDetails: {
              ShippingType: 'Flat',
              ShippingServiceOptions: {
                ShippingServicePriority: 1,
                ShippingService: 'USPSMedia',
                ShippingServiceCost: '2.50',
                ShippingServiceAdditionalCost: '0.50'
              }
            },
            ReturnPolicy: {
              ReturnsAcceptedOption: 'ReturnsAccepted',
              RefundOption: 'MoneyBack',
              ReturnsWithinOption: 'Days_30',
              Description: 'Text Description of Return Policy',
              ShippingCostPaidByOption: 'Buyer'
            },
            ListingType: 'FixedPriceItem',
            Country: 'US',
            Currency: 'USD',
            PostalCode: '01243',
            PaymentMethods: 'VisaMC',
            PictureDetails: {
              GalleryType: 'Gallery',
              GalleryURL: product.image,
              PictureURL: product.image
            }
          }
        }
      }

      retval.push(builder.buildObject(processed))
    })

    resolve({
      processed: retval,
      numbers: arr
    })
  })
}
