// module.exports=CategoryModel;
const mongoose = require("mongoose");
// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category required"],
      unique: [true, "Category must be unique"],
      minlength: [2, "Too short category name"],
      maxlength: [32, "Too long category name"],
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
// findOne  findAll    updata
const imageURL=(doc)=>{
  if(doc.image){
    const imageUrl=`${process.env.BASS_URL}/categories/${doc.image}`
    doc.image=imageUrl
  }
}
categorySchema.post('init',(doc)=>{
  imageURL(doc)
})
// create
categorySchema.post('save',(doc)=>{
  imageURL(doc)
})
// 2- Create model
const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
