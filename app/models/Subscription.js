var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SubscriptionSchema = new Schema({
    'email': {
        type: String,
        lowercase: true
    },
    'comments': String
});

SubscriptionSchema.index({ email: 1 }, { unique: true });

SubscriptionSchema.statics.createSubscription = function (email) {
    const query = { email: email }
    const update = { email: email, comments: 'None' };
    const options = { upsert: true, new: true };
    // console.log(query, update, options);
    return this.findOneAndUpdate(query, update, options).exec();
};

mongoose.model('Subscription', SubscriptionSchema);
