module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "Failed",
      message: "Đăng nhập không thành công",
    });
  }
  return next();
};

const isLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
};

module.exports = {
  isLogin,
};
