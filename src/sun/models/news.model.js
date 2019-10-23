const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const NewsSchema = new mongoose.Schema({
  hasRu: {
    type: Boolean,
    required: true,
    default: false
  },
  title: {
    type: String,
    requried: true,
    unique: true
  },
  titleRu: {
    type: String,
    unique: false
  },
  descriptionRu: {
    type: String,
    unique: false
  },
  description: {
    type: String,
    required: true,
    unique: true
  },
  mainImage: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String
    },
    title: {
      type: String
    },
  },
  date: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    required: true,
    unique: true
  },
  contentRu: {
    type: String,
    unique: false
  },
  url: {
    type: String,
    required: true,
    unique: true
  }
})

NewsSchema.plugin(uniqueValidator, { message: 'Ошибка: поле {PATH} с таким значением уже существует.' });

module.exports = mongoose.model('Article', NewsSchema);
