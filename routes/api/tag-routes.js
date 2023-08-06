const express = require("express");
const router = express.Router();
const { Tag, Product, ProductTag } = require("../../models");

// GET all tags with associated Product data
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: Product, // Include associated Product data
    });
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET one tag by its `id` value with associated Product data
router.get("/:id", async (req, res) => {
  try {
    const tagId = req.params.id;
    const tag = await Tag.findByPk(tagId, {
      include: Product, // Include associated Product data
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create a new tag
router.post("/", async (req, res) => {
  try {
    const { tag_name } = req.body;
    const newTag = await Tag.create({ tag_name });

    res.status(201).json(newTag);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Bad request" });
  }
});

// PUT update a tag's name by its `id` value
router.put("/:id", async (req, res) => {
  try {
    const tagId = req.params.id;
    const { tag_name } = req.body;

    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Update the tag_name property of the tag
    tag.tag_name = tag_name;

    // Save the updated tag to the database
    await tag.save();

    res.json(tag);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Bad request" });
  }
});
// DELETE a tag by its `id` value
router.delete("/:id", async (req, res) => {
  try {
    const tagId = req.params.id;
    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    await tag.destroy();

    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
