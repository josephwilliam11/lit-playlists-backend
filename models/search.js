var mongoose = require("mongoose");

var Schema = mongoose.Schema;


var SearchSchema = new Schema({

  term: {
    type: String,
    required: true
  }
 
});

// This creates our model from the above schema, using mongoose's model method
var Search = mongoose.model("Search", SearchSchema);

// Export the Note model
module.exports = Search;