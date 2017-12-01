## shintech-ebay

### Synopsis

eBay SDK

### Installation

    npm install shintech-ebay
    
### Usage

    import { addItems } from 'shintech-ebay'
    
    var products =   [
      {
        description: 'Title',
        longDescription: 'LongDescription',
        quantity: '1',
        price: '1.0',
        listingDuration: '1',
        image: 'http://shintech/images/test.jpg'
      },
      {
        description: 'Title',
        longDescription: 'LongDescription',
        quantity: '1',
        price: '1.0',
        listingDuration: '1',
        image: 'http://shintech/images/test.jpg'
      }
    ]

    addItems(products, (err, response) => {
      console.log(response)
    })
