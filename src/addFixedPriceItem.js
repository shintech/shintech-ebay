import sendXML from './sendXML'
import xmlbuilder from 'xmlbuilder'

const opts = {
  EBAY_API: process.env['EBAY_API'],
  EBAY_APPID: process.env['EBAY_APPID'],
  EBAY_DEVID: process.env['EBAY_DEVID'],
  EBAY_CERTID: process.env['EBAY_CERTID'],
  EBAY_TOKEN: process.env['EBAY_TOKEN'],
  EMAIL: process.env['EMAIL']
}

export default async function (raw, callback) {
  const product = await configXML(raw)
  let response = await sendXML(product, 'AddFixedPriceItem')
  callback(null, response)
}

function configXML (product) {
  return new Promise(function (resolve, reject) {
    var processed = {
      RequesterCredentials: {
        eBayAuthToken: opts.EBAY_TOKEN
      },
      Version: '967',
      ErrorLanguage: 'en_US',
      WarningLevel: 'Low',
      Item: {
        SKU: product.number,
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
        },
        InventoryTrackingMethod: 'SKU'
      }
    }

    var root = xmlbuilder.create('AddFixedPriceItemRequest',
      {version: '1.0', encoding: 'UTF-8'},
      {pubID: null, sysID: null},
      {skipNullAttributes: false,
        headless: false,
        ignoreDecorators: false,
        separateArrayItems: false,
        noDoubleEncoding: false,
        stringify: {}}
      )

    root.att('xmlns', 'urn:ebay:apis:eBLBaseComponents')

    root.ele(processed)

    var xmlString = root.end({
      pretty: true,
      indent: '  ',
      newline: '\n',
      allowEmpty: false,
      spacebeforeslash: ''
    })

    var obj = {
      template: xmlString,
      numbers: product.number
    }

    resolve(obj)
  })
}
