const jwt = require("jsonwebtoken");
const User = require('../models/User');
const Company = require("../models/Company");

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Note: decoded payload contains { id, role, companyId }
        req.user = decoded;
        // Backward-compat helpers for older controller code.
        req.user.userId = decoded.id;
        req.user.company = decoded.companyId;

        // Tenant gating (suspended/rejected & subscription expiry).
        if (decoded.role !== "SUPER_ADMIN") {
            const company = await Company.findById(decoded.companyId).select("status subscription");
            if (!company) {
                return res.status(403).json({ message: "Company not found" });
            }

            if (company.status?.toUpperCase() !== "APPROVED") {
                return res.status(403).json({ message: "Company not approved", status: company.status });
            }

            // Only check subscription expiry if a subscription exists and active is explicitly false
            // or if the end date has passed.
            // Only block if subscription is explicitly set to inactive AND expired
            if (company.subscription && company.subscription.isActive === false) {
                const endDate = company.subscription.endDate;
                // If there's no end date at all, don't block
                if (endDate && new Date(endDate) < new Date()) {
                    return res.status(403).json({ message: "Subscription expired" });
                }
            }
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token failed' });
    }
};

module.exports = { protect };
