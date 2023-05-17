import mongoose from 'mongoose';

const Schema = mongoose.Schema;
// const Mixed = Schema.Types.Mixed;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    email: {
      type: String,
      required: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    isSubscribed: { type: Boolean, default: false },
    subscriptionStart: { type: Date, default: null },
    subscriptionEnd: { type: Date, default: null },

  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
