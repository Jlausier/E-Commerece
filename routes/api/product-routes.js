const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// GET all products with associated Category and Tag data
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category }, // Include associated Category data
        { model: Tag }, // Include associated Tag data
      ],
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one product by its `id` value with associated Category and Tag data
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId, {
      include: [
        { model: Category }, // Include associated Category data
        { model: Tag }, // Include associated Tag data
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create a new product
router.post('/', async (req, res) => {
 
  try {
    const { name, price, description, tagIds } = req.body;

    // Create a new product with the provided data
    const newProduct = await Product.create({
      product_name: name,
      price,
      description,
    });

    // If there are product tags, create pairings in the ProductTag model
    if (tagIds && tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Bad request' });
  }
});



// PUT update a product by its `id` value
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { product_name, price, stock, tagIds } = req.body;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product data
    product.product_name = product_name;
    product.price = price;
    product.stock = stock;
    await product.save();

    if (tagIds && tagIds.length) {
      // Update product tag associations if tagIds are provided
      const productTags = await ProductTag.findAll({
        where: { product_id: productId },
      });

      // Create filtered list of new tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: productId,
            tag_id,
          };
        });

      // Figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !tagIds.includes(tag_id))
        .map(({ id }) => id);

      // Run both actions
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
});

// DELETE a product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
