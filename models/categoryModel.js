const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: [true, "Category name must be unique"],
      minlength: [3, "Category name must be at least 3 characters"],
      maxlength: [32, "Category name must be at most 32 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false, // Exclude the __v field
    },
    toObject: { virtuals: true },
  }
);

categorySchema.virtual("SubCategory", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "category", // matches SubCategory.category
  justOne: false,
});

categorySchema.set("toObject", { virtuals: true });
categorySchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Category", categorySchema);
