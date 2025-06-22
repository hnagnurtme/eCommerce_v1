/**
    Discount Services
    1- Generate Discout Code [ Shop / Admin]
    2- Get discount amount [User]
    3- Get all discount codes [User / Shop]
    4- Verify discount code [User]
    5- Delete discount code [Shop/ Admin]
    6- Cancel discount code [User]
**/

const { NotFoundError, BadRequestError } = require("../core/error.respone");
const { discountModel } = require("../models/discount.model");
const { convertToObjectId } = require("../utils");
const { findAllProducts } = require("./product.service");

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_uses,
      uses_count,
      max_uses_per_user,
    } = payload;

    // Kiem tra tai controller

    // create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active === true) {
      throw new NotFoundError("Da ton tai discount");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: 0,
      discount_users_used: uses_count,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_shopId: shopId,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : product_ids
    });

    return newDiscount;
  }

  static async getAllDiscountCodesWithProduct({
    code, shopId, userId, limit, page
  }) {
    // Check if discount exists
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (!foundDiscount || foundDiscount.discount_is_active !== true) {
      throw new NotFoundError("Discount not found or inactive");
    }

    const {
      discount_applies_to, discount_product_ids
    } = foundDiscount;
    
    let products = [];
    
    if (discount_applies_to === 'all') {
      /// getAll product
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shopId),
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name']
      });
    }

    if (discount_applies_to === 'specific') {
      //. get by Ids
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name']
      });
    }

    return {
      discount: foundDiscount,
      products
    };
  }

  static async getAllDiscountCodesByShop({ shopId, limit = 50, page = 1 }) {
    const discounts = await discountModel
      .find({
        discount_shopId: convertToObjectId(shopId),
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return discounts;
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await discountModel
      .findOne({
        discount_code: codeId,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (!foundDiscount) {
      throw new NotFoundError("Discount doesn't exist");
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_start_date,
      discount_end_date,
      discount_max_uses_per_user,
      discount_type,
      discount_value,
      discount_applies_to,
      discount_product_ids
    } = foundDiscount;

    // Check if discount is still active
    if (!discount_is_active) {
      throw new BadRequestError("Discount expired");
    }

    // Check if discount is not yet started or already ended
    if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
      throw new BadRequestError("Discount code has expired or not started yet");
    }

    // Check if discount has reached max uses
    if (discount_max_uses > 0 && discount_users_used.length >= discount_max_uses) {
      throw new BadRequestError("Discount has reached maximum usage");
    }

    // Check if user has already used this discount too many times
    if (discount_max_uses_per_user > 0) {
      const userUsedCount = discount_users_used.filter(user => user.toString() === userId).length;
      if (userUsedCount >= discount_max_uses_per_user) {
        throw new BadRequestError("You have reached maximum usage for this discount");
      }
    }

    // Calculate order value from products
    let totalOrderValue = 0;
    let totalApplicableValue = 0;

    for (const product of products) {
      const { productId, quantity, price } = product;
      const productValue = quantity * price;
      totalOrderValue += productValue;

      // Check if the product is applicable for the discount
      if (discount_applies_to === 'all' || 
          (discount_applies_to === 'specific' && 
           discount_product_ids.includes(productId))) {
        totalApplicableValue += productValue;
      }
    }

    // Check if order meets minimum value requirement
    if (totalOrderValue < discount_min_order_value) {
      throw new BadRequestError(`Discount requires minimum order of ${discount_min_order_value}`);
    }

    // Calculate the discount amount
    let discountAmount = 0;
    if (discount_type === 'fixed_amount') {
      discountAmount = discount_value;
    } else if (discount_type === 'percentage') {
      discountAmount = totalApplicableValue * (discount_value / 100);
    }

    return {
      totalOrderValue,
      discount: discountAmount,
      totalPrice: totalOrderValue - discountAmount
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectId(shopId)
    });

    if (!deleted) {
      throw new NotFoundError("Discount not found");
    }

    return deleted;
  }

  static async cancelDiscountCode({ shopId, codeId, userId }) {
    const foundDiscount = await discountModel.findOne({
      discount_code: codeId,
      discount_shopId: convertToObjectId(shopId)
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount not found");
    }

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId
      },
      $inc: {
        discount_uses_count: -1
      }
    }, { new: true });

    return result;
  }
}

module.exports =  DiscountService;
