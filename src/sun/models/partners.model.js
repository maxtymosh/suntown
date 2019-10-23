const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const PartnersSchema = new mongoose.Schema({
  hasRu: {
    type: Boolean,
    required: true,
    default: false
  },
  company: {
    type: String,
    required: true,
    unique: true
  },
  companyRu: {
    type: String
  },
  description: {
    type: String,
    required: true,
    unique: true
  },
  descriptionRu: {
    type: String,
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  mainImage: {
    src: {
      type: String,
    },
    alt: {
      type: String
    },
    title: {
      type: String
    }
  },
  additionalImages: [{
    src: {
      type: String
    },
    alt: {
      type: String
    },
    title: {
      type: String
    }
  }],
  videoName: {
    type: String
  },
  videoNameRu: {
    type: String
  },
  video:{
    type: String
  }
})

PartnersSchema.plugin(uniqueValidator, { message: 'Ошибка: поле {PATH} с таким значением уже существует.' });

module.exports = mongoose.model('Partners', PartnersSchema);