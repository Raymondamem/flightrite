const ensureLoggedin = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user || req.user.isAdmin == 1) {
        return res.redirect('/api/signin');
    }
    next();
};

const ensureAdminAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user || req.user.isAdmin !== 1) {
        return res.redirect('/api/admin/signin');
    }
    next();
};

module.exports = { ensureLoggedin, ensureAdminAuthenticated };
