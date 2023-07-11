import { validationResult, body } from "express-validator"

export const validate = (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
        return true;
    } else {
        res.send({errors: result.array()})
        return false;
    }
}

export const isGoodName = (field) => body(field).trim().isAscii().notEmpty().escape();