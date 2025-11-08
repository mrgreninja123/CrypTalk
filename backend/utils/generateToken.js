import jwt from "jsonwebtoken"

const generateTokenAndSetCookie = (userID, res) => {
    const token = jwt.sign({ userID}, process.env.JWT_TOKEN, {
        expiresIn: '15d',
    });

    res.cookie("jwt", token,{ 
        maxAge: 15 * 24 * 60 * 60 * 1000, //MS 
        httpOnly: true, //prevent XSS attacks cross-site scripting attakcs
        sameSite:"strict", //CSRF attacks cross-site request forgery attacks 
        secure: process.env.NOD_ENV !== "development",
    });
};

export default generateTokenAndSetCookie;