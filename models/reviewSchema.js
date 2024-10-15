const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Tutor = require("./tutorSchema");

const reviewSchema = new Schema(
  {
    tutor: {
      type: mongoose.Types.ObjectId,
      ref: "Tutor",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    reviewText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name photo" });
  next();
});

reviewSchema.statics.calcAverageRating = async function (tutorId) {
  const stats = await this.aggregate([
    { $match: { tutor: tutorId } },
    {
      $group: {
        _id: "$tutor",
        numOfRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await Tutor.findByIdAndUpdate(tutorId, {
    totalRating: stats[0].numOfRating,
    averageRating: stats[0].avgRating,
  });
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.tutor);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
