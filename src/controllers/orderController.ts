import type { Request, Response, NextFunction } from "express";

import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import orderModel from "../models/orderModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import productModel from "../models/productModel.js";
import type { AuthRequest } from "./userController.js";


// Create new Order
export const newOrder = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    const order = await orderModel.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: new Date(),
      user: req.user?._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  }
);

// Get single order
export const getSingleOrder = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const order = await orderModel.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  }
);

// Get logged-in user orders
export const myOrders = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    const orders = await orderModel.find({ user: req.user?._id });

    res.status(200).json({
      success: true,
      orders,
    });
  }
);

// Get all orders (Admin)
export const getAllOrders = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    const orders = await orderModel.find();

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  }
);

// Update order status (Admin)
export const updateOrder = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered") {
      return next(
        new ErrorHandler("You have already delivered this order", 400)
      );
    }

    if (req.body.status === "Shipped") {
      for (const item of order.orderItems) {
        await updateStock(item.product, item.quantity);
      }
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  }
);

// Helper: update stock
async function updateStock(id: string, quantity: number) {
  const product = await productModel.findById(id);

  if (!product) return;

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// Delete order (Admin)
export const deleteOrder = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
    });
  }
);