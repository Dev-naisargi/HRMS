const AuditLog = require("../models/AuditLog");

const auditLogger = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    if (req.user && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      // Log the activity after the response is sent (simplified)
      const logData = {
        user: req.user.userId,
        company: req.user.companyId,
        action: `${req.method} ${req.originalUrl}`,
        method: req.method,
        url: req.originalUrl,
        ipAddress: req.ip,
        details: req.body,
      };

      AuditLog.create(logData).catch((err) =>
        console.error("Audit Log Creation Error:", err)
      );
    }
    originalSend.apply(res, arguments);
  };

  next();
};

module.exports = auditLogger;
