const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const slugify = require("slugify");

exports.createProduct = async (req,res)=>{

  try {

    const {
      name,
      description,
      category,
      price,
      stock,
      colors,
      sizes
    } = req.body;

    const uploadedImages = [];

    if(req.files){

      for(const file of req.files){

        const base64 =
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        const result =
        await cloudinary.uploader.upload(
          base64,
          {
            folder:"m4-products"
          }
        );

        uploadedImages.push(
          result.secure_url
        );
      }
    }

    const product =
    await Product.create({

      name,

      slug: slugify(name,{
        lower:true
      }),

      description,
      category,
      price,
      stock,
      colors,
      sizes,

      images: uploadedImages

    });

    res.status(201).json(product);

  } catch(error){

    console.error(error);

    res.status(500).json({
      message:error.message
    });

  }
};

exports.getProducts = async (req,res)=>{

  const products =
  await Product.find()
  .sort({
    createdAt:-1
  });

  res.json(products);
};

exports.getSingleProduct = async (req,res)=>{

  const product =
  await Product.findById(
    req.params.id
  );

  if(!product){

    return res.status(404).json({
      message:"Product not found"
    });

  }

  res.json(product);
};

exports.updateProduct = async (req,res)=>{

  const updated =
  await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new:true
    }
  );

  res.json(updated);
};

exports.deleteProduct = async (req,res)=>{

  await Product.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message:"Deleted Successfully"
  });
};