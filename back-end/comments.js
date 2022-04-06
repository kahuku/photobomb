const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const users = require("./users.js");
const User = users.model;
const validUser = users.valid;

const photos = require("./photos.js");
const Photo = photos.model;

const commentSchema = new mongoose.Schema({
    user: {
        firstName:String,
        lastName:String
    },
    photo: {
        type: mongoose.Schema.ObjectId,
        ref: 'Photo'
    },
    comment:String,
    date:String
});

const Comment = mongoose.model('Comment', commentSchema);

router.post("/:id", async (req, res) => {
    try {
        let comment = new Comment({
            comment: req.body.comment,
            user: req.body.user,
            photo: req.body.photo,
            date: req.body.date
          });
        console.log(comment);
        await comment.save();
        return res.sendStatus(200);
    } catch(error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.get("/:id", async (req, res) => {
    try {
        let foundPhoto = await Photo.find({
            _id: req.params.id
        });
        // console.log(foundPhoto);
        let comments = await Comment.find({
            photo: foundPhoto
        });
        return res.send(comments);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

module.exports = {
    routes: router,
    model: Comment
  };