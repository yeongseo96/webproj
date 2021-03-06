const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true},
  location: {type: String, trim: true},
  starts: {type : String, trim: true},
  ends: {type: String, trim: true},
  starts_time: {type: String, trim: true},
  ends_time: {type: String, trim: true},
  event_description: {type: String, trim: true},
  organizer_name: {type: String, trim: true},
  organizer_description: {type: String, trim: true},
  price: {type: String, trim:true},
  event_type: {type: String, trim:true},
  event_topic: {type:String, trim:true},
  numLikes: {type: Number, default: 0},
  numParticipations: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Question = mongoose.model('Question', schema);

module.exports = Question;
