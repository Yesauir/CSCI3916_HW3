var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
//TODO: Review https://mongoosejs.com/docs/validation.html
//inspired by Users.js
mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

// Movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true, index: { unique: true }},
    releaseYear: { type: String, required: true},
    genre: { type: String, enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller',
            'Western'], required: true},
    actors: { type: [{actorName: String, characterName: String}], required: true }
});



// return the Movies model
module.exports = mongoose.model('Movies', MovieSchema);