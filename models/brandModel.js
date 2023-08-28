// module.exports=CategoryModel;
const mongoose = require('mongoose');
// 1- Create Schema
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Brand required'],
        unique: [true, 'Brand must be unique'],
        minlength: [2, 'Too short Brand name'],
        maxlength: [32, 'Too long Brand name'],
    },
    // A and B => shoping.com/a-and-b
    slug: {
        type: String,
        lowercase: true,
    },
    image: String,
    },
    { timestamps: true }
);

const imageURL=(doc)=>{
    if(doc.image){
      const imageUrl=`${process.env.BASS_URL}/brands/${doc.image}`
      doc.image=imageUrl
    }
  }
  brandSchema.post('init',(doc)=>{
    imageURL(doc)
  })
  // create
  brandSchema.post('save',(doc)=>{
    imageURL(doc)
  })
// 2- Create model
const BrandModel = mongoose.model('Brand', brandSchema);

module.exports = BrandModel;