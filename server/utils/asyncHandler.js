// ===========================================
// ASYNC HANDLER UTILITY
// ===========================================
// WHY?
// Every controller function that talks to the database needs
// try/catch for error handling. That's LOTS of repetitive code.
//
// WITHOUT this utility (repetitive):
//   const getProducts = async (req, res, next) => {
//     try {
//       const products = await Product.find();
//       res.json(products);
//     } catch (error) {
//       next(error);
//     }
//   };
//
// WITH this utility (clean):
//   const getProducts = asyncHandler(async (req, res) => {
//     const products = await Product.find();
//     res.json(products);
//   });
//
// It wraps every async function and automatically catches errors!
// ===========================================

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
