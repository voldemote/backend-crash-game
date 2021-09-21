const logger = require('../util/logger');
const userApi = require('../services/user-api');
const { ErrorHandler } = require('../util/error-handler');
const authService = require('../services/auth-service');
const mailService = require('../services/mail-service');
const { validationResult } = require('express-validator');
const userService = require('../services/user-service');
const bcrypt = require('bcryptjs');

module.exports = {
  async createUser(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandler(422, errors));
    }

    try {
      const { password, email, username } = req.body;

      const existing = await userApi.getUserByIdEmailPhoneOrUsername(email);

      if (existing) {
        return next(new ErrorHandler(400, 'User exists'));
      }

      const counter = ((await userApi.getUserEntriesAmount()) || 0) + 1;
      const passwordHash = await bcrypt.hash(password, 8);

      const createdUser = await userApi.createUser({
        email,
        username: username || `wallfair-${counter}`,
        password: passwordHash,
        preferences: {
          currency: 'WFAIR',
        },
      });

      await userService.mintUser(createdUser.id.toString());
      await mailService.sendConfirmMail(createdUser);

      return res.status(201).json({
        userId: createdUser.id,
        email: createdUser.email,
      });
    } catch (err) {
      logger.error(err);
    }
    return res.status(500).send();
  },

  async login(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandler(422, errors));
    }

    try {
      const { userIdentifier, password } = req.body;
      const user = await userApi.getUserByIdEmailPhoneOrUsername(userIdentifier);
      const valid = user && (await bcrypt.compare(password, user.password));

      if (!valid) {
        return next(new ErrorHandler(401, 'Invalid login'));
      }

      res.status(200).json({
        userId: user.id,
        session: await authService.generateJwt(user),
      });
    } catch (err) {
      logger.error(err);
      return next(new ErrorHandler(401, "Couldn't verify user"));
    }
  },

  async verifyEmail(req, res, next) {
    try {
      const user = await userApi.verifyEmail(req.body.email);
      if (!user) return next(new ErrorHandler(404, "Couldn't find user"));
      return res.status(200).send();
    } catch (err) {
      logger.error(err);
      return res.status(500).send();
    }
  },

  async resetPassword(req, res, next) {
    try {
      const user = await userApi.getOne(req.body.email);
      if (!user) return next(new ErrorHandler(404, "Couldn't find user"));
      await mailService.sendResetPasswordMail(user);

      return res.status(200).send();
    } catch (err) {
      logger.error(err);
      return res.status(500).send();
    }
  },
};