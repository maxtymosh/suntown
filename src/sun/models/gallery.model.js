const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const GallerySchema = new mongoose.Schema({
  hasRu: {
    type: Boolean,
    required: true,
    default: false
  },
  description: {
    type: String,
    required: true,
    unique: true
  },
  descriptionRu: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  imageAlt: {
    type: String,
    required: true
  },
  imageTitle: {
    type: String,
    required: true
  }
})

GallerySchema.plugin(uniqueValidator, { message: 'Ошибка: поле {PATH} с таким значением уже существует.' });

module.exports = mongoose.model('Gallery', GallerySchema);