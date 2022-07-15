const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwt_secret = process.env.jwt_secret;

const UserController = {
  async register(req, res, next) {
    try {
      const password = bcrypt.hashSync(req.body.password, 10);
      console.log('aaaaaaaa',req.body.password)
      const user = await User.create({
        ...req.body,
        password: password,
        role: "user",
      });
      res.status(201).send({ message: "User created", user });
    } catch (error) {
      console.error(error);
      error.origin = "User";
      next(error);
    }
  },
  async login(req, res) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).send("Incorrect username or password");
      }
      const isMatch = bcrypt.compareSync(req.body.password, user.password);
      if (!isMatch) {
        return res.status(400).send("Incorrect username or password");
      }
      token = jwt.sign({ _id: user._id }, jwt_secret);
      if (user.tokens.length > 4) user.tokens.shift();
      user.tokens.push(token);
      await user.save();
      return res.send({ message: "Welcome " + user.name, token, user });
    } catch (error) {
      res
        .status(500)
        .send({ message: "There has been a problem on the server" });
    }
  },
  async logout(req, res) {
    try {
      const user = await User.findByIdAndUpdate(req.user._id, {
        $pull: { tokens: req.headers.authorization },
      });
      res.status(200).send({ message: "User logged out successfully", user });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "there has been a problem disconnecting the user" });
    }
  },
  async update(req, res) {
    try {
      const { firstName, lastName, gender, disabled } = req.body;
      const hashpassword = bcrypt.hashSync(req.body.password, 10);
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, password: hashpassword, lastName, gender, disabled },
        { new: true }
      );
      res.status(200).send({ message: "User update successfully", user });
    } catch (error) {
      console.error(error);
      res.send(error);
    }
  },
  async findUserByFirstName(req, res) {
    try {
      if (req.body.firstName.length > 20) {
        return res.status(400).send("Search too long");
      }
      const firstName = new RegExp(req.body.firstName, "i");
      const user = await User.find({ firstName });
      res.status(200).send({ message: "User found successfully", user });
    } catch (error) {
      console.error(error);
      res.send(error);
    }
  },
  async findUserById(req, res) {
    try {
      const user = await User.findById(req.params._id);
      if (!user) {
        res.status(404).send("This user does not exist");
      }
      res.status(200).send({ message: "User found successfully", user });
    } catch (error) {
      console.error(error);
      res.send(error);
    }
  },
  async findAllUser(req, res) {
    try {
      const users = await User.find();
      res.status(200).send({message:"All users found",users})
    } catch (error) {
      console.error(error)
      res.send(error)
    }
  },
  async deleteUserById(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params._id);
      res.status(200).send({ message: "User delete successfyly", user });
    } catch (error) {
      console.error(error);
      res.send(error);
    }
  },
};

module.exports = UserController;
