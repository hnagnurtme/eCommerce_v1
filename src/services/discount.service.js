/**
    Discount Services
    1- Generate Discout Code [ Shop / Admin]
    2- Get discount amount [User]
    3- Get all discount codes [User / Shop]
    4- Verify discount code [User]
    5- Delete discount code [Shop/ Admin]
    6- Cancel discount code [User]
**/

const { NotFoundError } = require("../core/error.respone");
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
    const foundDiscount = discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active === true) {
      throw new NotFoundError(" Da ton tai discount");
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
      discount_product_ids: applies_to ==='all'? [] : product_ids
    });


    return newDiscount
  }



  static  async getAllDiscountCodesWithProduct({
    code , shopId, userId, limit , page
  }){
    const foundDiscount = discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (!foundDiscount && foundDiscount.discount_is_active === true) {
      throw new NotFoundError(" Da ton tai discount");
    }


    const {
        discount_applies_to ,discount_product_ids
    } = foundDiscount
    if( discount_applies_to === 'all'){
        /// getAll product
        product =  await findAllProducts({
            filter : {
                product_shop : convertToObjectId(shopId),
                isPublished : true
            },
            limit : +limit,
            page : +page ,
            sort :'ctime',
            select :['product_name']
        })
    }

    if( discount_applies_to ==='specific'){
        //. get by Ids

        product =  await findAllProducts({
            filter : {
                _id : {$in : discount_product_ids },
                isPublished : true
            },
            limit : +limit,
            page : +page ,
            sort :'ctime',
            select :['product_name']
        })
    }
  }
}
