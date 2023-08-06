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
router.put('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updatedData = req.body;

    // Check if the category with the given id exists
    const existingCategory = await Category.findOne({ where: { id: categoryId } });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update the category data
    await Category.update(updatedData, {
      where: {
        id: categoryId,
      },
    });

    // Fetch the updated category from the database
    const updatedCategory = await Category.findByPk(categoryId);

    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// DELETE a Category by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
