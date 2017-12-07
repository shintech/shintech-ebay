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
  const product = await configProduct(raw)
  const xml = await configXML(product, raw.number)
  let response = await sendXML(xml, 'AddItem')
  callback(null, response)
}

function configProduct (product) {
  return new Promise(function (resolve, reject) {
    var processed = {
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

    resolve(builder.buildObject(processed))
  })
}

function configXML (product, number) {
  return new Promise(function (resolve, reject) {
    var template = _.template(`
<?xml version="1.0" encoding="utf-8"?>
<AddItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
      <eBayAuthToken><%- opts.EBAY_TOKEN %></eBayAuthToken>
    </RequesterCredentials>
  <Version>967</Version>
  <ErrorLanguage>en_US</ErrorLanguage>
  <WarningLevel>Low</WarningLevel>
  <%= product %>
</AddItemRequest>
`)

    var obj = {
      template: template({product: product, opts: opts}),
      numbers: number
    }

    resolve(obj)
  })
}
