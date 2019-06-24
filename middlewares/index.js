const isAuthenticated = (req, res, next) => {
    if (req.user) return next();
    res.redirect('/login');
};

module.exports = {
    isAuthenticated
};