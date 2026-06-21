import type { Response } from "express";
import type { IUser } from "../models/userModel.js";
import { env } from "../config/env.js";

const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const token = user.getJWTToken();
    const options = {
        expires: new Date(Date.now() + Number(env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }
    res.status(statusCode).cookie("token", token, options);
    res.json({
        success: true,
        user,
        token,
    });
}

export default sendToken;