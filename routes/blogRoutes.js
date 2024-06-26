const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const {clearHash}=require("../services/cache")
const cleanCache=require('../middlewares/cleanCache')
const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
   

    //if no, we need to respond to requests and update our cache to store the data

    const blogs = await Blog.find({ _user: req.user.id }).cache({
      key: req.user.id
    });
    // console.log("serving from mongo")
    res.send(blogs);

    // client.set(req.user.id, JSON.stringify(blogs))
  });

  app.post('/api/blogs', requireLogin,cleanCache,async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }

    clearHash(req.user.id)
  });
};
