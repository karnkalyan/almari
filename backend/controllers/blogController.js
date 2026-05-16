const prisma = require('../prismaClient');

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getBlogPosts = async (req, res) => {
  try {
    const where = req.query.all === 'true' ? {} : { isPublished: true };
    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBlogPost = async (req, res) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }] },
    });
    if (!post) return res.status(404).json({ message: 'Blog post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBlogPost = async (req, res) => {
  try {
    const { title, slug, excerpt, content, image, isPublished } = req.body;
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: slugify(slug || title),
        excerpt,
        content,
        image,
        isPublished: Boolean(isPublished),
      },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBlogPost = async (req, res) => {
  try {
    const { title, slug, excerpt, content, image, isPublished } = req.body;
    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: {
        title,
        slug: slug ? slugify(slug) : undefined,
        excerpt,
        content,
        image,
        isPublished: Boolean(isPublished),
      },
    });
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBlogPost = async (req, res) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ message: 'Blog post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost };
