var mongoose = require("mongoose");

var Schema = mongoose.Schema;


var UserSchema = new Schema({
 
  user: {
    type: String,
    required: true
  },
  
  search: [{
    type: Schema.Types.ObjectId,
    ref: "Search"
  }]
});

// This creates our model from the above schema, using mongoose's model method
var User = mongoose.model("User", UserSchema);

// Export the Article model
module.exports = User;