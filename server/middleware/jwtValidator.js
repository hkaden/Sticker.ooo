const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        console.log(res.getHeaders())
        const token = res.getHeaders().authorization.split(" ")[1];
        console.log("token in jwtValidator = " + token);
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if(err) {
                return res.status(401).json({
                    message: 'Failed'
                });
            }
        });
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Failed'
        });
    }
};
