'use strict';
var sanitaze = require('validator').sanitize;

/**
 * @class GroupMessage
 * @classdesc
 * Class that represents users' messages in group chats.
 * Usually used from {@link User} class.
 * This class is an ancestor of mongoose active record object, described here {@link http://mongoosejs.com/docs/documents.html},
 * {@link http://mongoosejs.com/docs/queries.html}
 *
 * Note: before saving message have all special symbols escaped.
 *
 * @property {ObjectId} _id
 * @property {string} id
 * @property {Group} group
 * @property {ObjectId} from
 * @property {User} fromProfile
 * @property {Date} createdAt
 * @property {string} message
 * */


module.exports = exports = function (core) {
  var groupMessageSchema = new core.mongoose.Schema({
    'group': core.mongoose.Schema.Types.ObjectId,
    'from': core.mongoose.Schema.Types.ObjectId,
    'fromProfile': { type: core.mongoose.Schema.Types.ObjectId, ref: 'User' },
    'createdAt': { type: Date, default: Date.now },
    'message': {type: String, trim: true } //trim whitespaces - http://mongoosejs.com/docs/api.html#schema_string_SchemaString-trim
  });

  groupMessageSchema.pre('save', function (next) {
    var msg = this;
    msg.message = sanitaze(msg.message).escape();
    next();
  });

  groupMessageSchema.index({
    group: 1,
    from: 1,
    createdAt: 1
  });

  return core.mongoConnection.model('GroupMessage', groupMessageSchema);
};
