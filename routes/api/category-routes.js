const router = require('express').Router();
const { Category, Product } = require('../../models');

// GET all categories with associated Products
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: Product, // Include associated Products
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one Category by its `id` value with associated Products
router.get('/:id', async (req, res) => {
  try {
    const CategoryId = req.params.id;
    const Category = await Category.findByPk(CategoryId, {
      include: [{model: Product}]
    });

    if (!Category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(Category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create a new Category
router.post('/', async (req, res) => {
  try {
    const { CategoryName } = req.body;
    const newCategory = await Category.create({ category_name: CategoryName });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
})



// PUT update a Category by its `id` value
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// DELETE a Category by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const CategoryId = req.params.id;
    const Category = await Category.findByPk(CategoryId);

    if (!Category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.destroy();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
