import rateLimit from "express-rate-limit";
// Rate Limit
export const pdfRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // ⏱️ 5 minutes
    max: 3, // ✅ max 3 requests allowed
    message:
        "Too many PDF requests from this IP, please try again after 5 minutes.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Global Error
export const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: err.success || false,
        message: err.message || "Something went wrong",
        errors: err.errors || [],
        data: err.data || null,
        stack: err.stack,
        redirectTo: err.redirectTo || null,
    });
};
