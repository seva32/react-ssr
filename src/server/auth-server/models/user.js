/* eslint-disable consistent-return */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
// eslint-disable-next-line prefer-destructuring
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const ThirdPartyProviderSchema = new Schema({
  provider_name: {
    type: String,
    default: null,
  },
  provider_id: {
    type: String,
    default: null,
  },
  provider_data: {
    type: {},
    default: null,
  },
});

// define model
const userSchema = new Schema(
  {
    email: { type: String, unique: true, lowercase: true },
    email_is_verified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    referral_code: {
      type: String,
      default() {
        let hash = 0;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < this.email.length; i++) {
          hash = this.email.charCodeAt(i) + ((hash << 5) - hash); // eslint-disable-line
        }
        const res = (hash & 0x00ffffff).toString(16).toUpperCase(); // eslint-disable-line
        return '00000'.substring(0, 6 - res.length) + res;
      },
    },
    third_party_auth: [ThirdPartyProviderSchema],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }, // aceptar datos que aun no estan en el schema
);
// on save hook ecrypt pass
userSchema.pre('save', function (next) {
  const user = this;
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});
// crear un method para comparar pass
userSchema.methods.comparePassword = function (candidatePass, cb) {
  // if candidatePass type is number error
  bcrypt.compare(candidatePass.toString(), this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

// create model class
const ModelClass = mongoose.model('user', userSchema);

// export model
export default ModelClass;
