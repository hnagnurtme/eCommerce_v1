const { isDate } = require("lodash");
const { NotFoundError } = require("../core/error.respone");
const {
  findAllDraftedForShop,
  publishProductByShop,
  searchProductByUser,
  findAllPublishedForShop,
  unPublishProductByShop,
  findAllProducts,
  createProduct,
  createClothing,
  createElectronic,
  createFurniture,
  updateProductById,
  updateClothingById,
  updateElectronicById,
  updateFurnitureById,
  findProductById,
  deleteProductById,
} = require("../models/repositories/product.repo");
const { insertInventory } = require("../models/repositories/inventory.repo");

// define base product
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_type,
    product_shop,
    product_attributes,
    product_quantity,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_quantity = product_quantity;
  }

  async createProduct(productId) {
    const newProduct = await createProduct({
      ...this,
      _id: productId,
    });

    if (newProduct) {
      // add product stock in inventory
      await insertInventory(
        newProduct._id,
        this.product_shop,
        this.product_quantity
      );
    }

    return newProduct;
  }

  async updateProduct(productId, bodyUpdate) {
    return await updateProductById(productId, bodyUpdate, {
      new: true,
    });
  }
}

// define sub class
class Clothing extends Product {
  async createProduct() {
    const newClothing = await createClothing({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new NotFoundError("Create clothing error");
    }

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new NotFoundError("Create product error");
    }
    return newProduct;
  }
}

class Electronic extends Product {
  async createProduct() {
    const newElectronic = await createElectronic({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });

    if (!newElectronic) {
      throw new NotFoundError("Lỗi tạo electronic");
    }

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) {
      throw new NotFoundError("Lỗi tạo product");
    }
    return newProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await createFurniture({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });

    if (!newFurniture) {
      throw new NotFoundError("Lỗi tạo furniture");
    }

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) {
      throw new NotFoundError("Lỗi tạo product");
    }
    return newProduct;
  }
}

// Factory class
class ProductFactory {
  static productRegistry = {}; // key Class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    this.validateProductData(type, payload);

    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new NotFoundError("Không tìm thấy loại sản phẩm");
    }

    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new NotFoundError("Không tìm thấy loại sản phẩm");
    }

    // Cập nhật sản phẩm chính
    const updatedProduct = await updateProductById(productId, {
      $set: {
        product_name: payload.product_name,
        product_thumb: payload.product_thumb,
        product_description: payload.product_description,
        product_price: payload.product_price,
        product_quantity: payload.product_quantity,
      },
    });

    if (!updatedProduct) {
      throw new NotFoundError("Không tìm thấy sản phẩm để cập nhật");
    }

    // Cập nhật các thuộc tính đặc biệt dựa vào loại sản phẩm
    if (payload.product_attributes) {
      switch (type) {
        case "Clothing":
          await updateClothingById(productId, {
            $set: payload.product_attributes,
          });
          break;
        case "Electronic":
          await updateElectronicById(productId, {
            $set: payload.product_attributes,
          });
          break;
        case "Furniture":
          await updateFurnitureById(productId, {
            $set: payload.product_attributes,
          });
          break;
      }
    }

    return updatedProduct;
  }
  // Put
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }
  /**
   * @description : Find all draft product of shop
   * @param {Number}  limit
   * @param {Number} skip
   * @return {JSON}
   */
  static async findAllDraftForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftedForShop({ query, limit, skip });
  }

  /**
   *
   * @param {*} param0
   * @returns
   */
  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishedForShop({ query, limit, skip });
  }

  static async searchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name"],
    });
  }

  static async findProduct({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  // Xóa sản phẩm
  static async deleteProduct(productId) {
    return await deleteProductById(productId);
  }

  // Tìm sản phẩm theo ID
  static async findProductById(productId) {
    return await findProductById(productId);
  }

  // Thêm phương thức xác thực dữ liệu
  static validateProductData(type, payload) {
    // Kiểm tra các trường chung
    if (
      !payload.product_name ||
      !payload.product_price ||
      !payload.product_quantity ||
      !payload.product_thumb
    ) {
      throw new NotFoundError("Thiếu thông tin sản phẩm cơ bản");
    }

    // Kiểm tra product_attributes dựa vào loại sản phẩm
    if (!payload.product_attributes) {
      throw new NotFoundError("Thiếu thông tin thuộc tính sản phẩm");
    }

    switch (type) {
      case "Electronic":
        if (!payload.product_attributes.manufacturer) {
          throw new NotFoundError(
            "Thiếu thông tin nhà sản xuất cho sản phẩm điện tử"
          );
        }
        break;

      case "Clothing":
        if (!payload.product_attributes.brand) {
          throw new NotFoundError("Thiếu thông tin thương hiệu cho quần áo");
        }
        break;

      case "Furniture":
        if (
          !payload.product_attributes.brand ||
          !payload.product_attributes.material
        ) {
          throw new NotFoundError(
            "Thiếu thông tin thương hiệu hoặc chất liệu cho nội thất"
          );
        }
        break;

      default:
        throw new NotFoundError("Loại sản phẩm không được hỗ trợ");
    }

    return true;
  }
}
// register productType
ProductFactory.registerProductType("Electronic", Electronic);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
