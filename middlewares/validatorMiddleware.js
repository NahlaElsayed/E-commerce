const { validationResult } = require('express-validator');

// @desc  Finds the validation errors in this request and wraps them in an object with handy functions
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validatorMiddleware;

// const {validationResult} = require('express-validator');
// const validatorMiddleware=(req,res,next)=>{
//     const errors= validationResult(req)
//     if(!errors.isEmpty()){
//         return res.status(400).json({errors:errors.array()})
//     }
//     //عشان يروح ل ال true (catgory)
//     // انا لو مكتبتهاش م هنقل علي اللي بعدها و هيفضل واقف
//     next();
// };
// module.exports=validatorMiddleware;