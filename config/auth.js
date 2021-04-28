
//validate request
module.exports = {
  ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
      return next();
    } else {
      res.redirect('/users/login');
    }
  }
};
  