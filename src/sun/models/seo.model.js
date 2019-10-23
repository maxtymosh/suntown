let mongoose = require('mongoose');

let SeoSchema = new mongoose.Schema({
  title: {
    type: String,
    // unique: true,
    required: true
  },
  description: {
    type: String,
    // unique: true,
    required: true
  },
  url: {
    type: String,
    // unique: true,
    required: true
  },
  pageType: {
    type: String,
    required: true
  },
  keywords: {
    type: String,
    default: ''
  },
  titleRu: {
   type: String
  },
	keywordsRu: {
	type: String
		//default: ''
	},
	descriptionRu:{
	type: String
		//required: true,
		//default: ''
	}
});

module.exports = mongoose.model('Seo', SeoSchema);
