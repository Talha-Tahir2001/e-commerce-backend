import type { Response, NextFunction } from "express";

// import cloudinary from "cloudinary";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import type { AuthRequest } from "./userController.js";
import productModel from "../models/productModel.js";
import ApiFeatures from "../utils/apiFeatures.js";
import ErrorHandler from "../utils/errorHandler.js";


// Create Product -- Admin
export const createProduct = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    let images: string[] = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks: any[] = [];

    // for (const image of images) {
    //   const result = await cloudinary.v2.uploader.upload(image, {
    //     folder: "products",
    //   });

    //   imagesLinks.push({
    //     public_id: result.public_id,
    //     url: result.secure_url,
    //   });
    // }

    req.body.images = imagesLinks;
    req.body.user = req.user?.id;

    const product = await productModel.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  }
);

// Get All Products
export const getAllProducts = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    const resultPerPage = 8;
    const productsCount = await productModel.countDocuments();

    const apiFeature = new ApiFeatures(productModel.find(), req.query)
      .search()
      .filter();

    let products = await apiFeature.query;
    const filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query;

    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    });
  }
);

// Get Admin Products
export const getAdminProducts = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    const products = await productModel.find();
    
    res.status(200).json({
      success: true,
      products,
    });
  }
);

// Get Product Details
export const getProductDetails = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  }
);

// Update Product -- Admin
export const updateProduct = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let product = await productModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    let images: string[] = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    if (images) {
    //   for (const img of product.images) {
    //     await cloudinary.v2.uploader.destroy(img.public_id);
    //   }

      const imagesLinks: any[] = [];

    //   for (const image of images) {
        // const result = await cloudinary.v2.uploader.upload(image, {
        //   folder: "products",
        // });

        // imagesLinks.push({
        //   public_id: result.public_id,
        //   url: result.secure_url,
        // });
    //   }

      req.body.images = imagesLinks;
    }

    product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  }
);

// Delete Product
export const deleteProduct = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // for (const img of product.images) {
    //   await cloudinary.v2.uploader.destroy(img.public_id);
    // }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  }
);

// Create or Update Review
// export const createProductReview = catchAsyncErrors(
//   async (req: AuthRequest, res: Response) => {
//     const { rating, comment, productId } = req.body;

//     const review = {
//       user: req.user?._id?.toString() || "",
//       name: req.user?.name || "",
//       rating: Number(rating),
//       comment: comment ?? "",
//     };

//     const product = await productModel.findById(productId);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }
//     const isReviewed = product.reviews.find(
//       (rev: any) => rev.user.toString() === req.user?._id.toString()
//     );

//     if (isReviewed) {
//       product.reviews.forEach((rev: any) => {
//         if (rev.user.toString() === req.user?._id.toString()) {
//           rev.rating = rating;
//           rev.comment = comment;
//         }
//       });
//     } else {
//       product.reviews.push(review);
//       product.numOfReviews = product.reviews.length;
//     }

//     let avg = 0;

//     product.reviews.forEach((rev: any) => {
//       avg += rev.rating;
//     });

//     product.ratings = avg / product.reviews.length;

//     await product.save({ validateBeforeSave: false });

//     res.status(200).json({
//       success: true,
//     });
//   }
// );

export const createProductReview = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    const { rating, comment, productId } = req.body;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const review = {
      user: req.user!._id.toString(),
      name: req.user!.name,
      rating: Number(rating),
      comment: comment ?? "",
    };

    const isReviewed = product.reviews.find(
      (rev: any) => rev.user.toString() === req.user!._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev: any) => {
        if (rev.user.toString() === req.user!._id.toString()) {
          rev.rating = Number(rating);
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev: any) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
    });
  }
);

// Get Reviews
export const getProductReviews = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const product = await productModel.findById(req.query["id"]);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  }
);

// Delete Review
export const deleteReview = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    const product = await productModel.findById(req.query["productId"]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviews = product.reviews.filter(
      (rev: any) => rev._id.toString() !== req.query["id"]
    );

    let avg = 0;

    reviews.forEach((rev: any) => {
      avg += rev.rating;
    });

    const ratings = reviews.length === 0 ? 0 : avg / reviews.length;

    const numOfReviews = reviews.length;

    await productModel.findByIdAndUpdate(req.query["productId"], {
      reviews,
      ratings,
      numOfReviews,
    });

    return res.status(200).json({
      success: true,
    });
  }
);