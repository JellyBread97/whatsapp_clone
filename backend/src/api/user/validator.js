import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const userSchema = {
  username: {
    in: ["body"],
    isString: {
      errorMessage: "name is a mandatory field",
    },
  },
  email: {
    in: ["body"],
    isEmail: {
      errorMessage: "email is a mandatory field",
    },
  },
  // avatar: {
  //   in: ["body"],
  //   isString: {
  //     errorMessage: "avatar is a mandatory field",
  //   },
  // },
  password: {
    in: ["body"],
    isString: {
      errorMessage: "password is a mandatory field",
    },
  },
};

const filteredSchema = {
  username: {
    in: ["query"],
    isString: {
      errorMessage: "username must be in query and type must be string to search!",
    },
  },
  email: {
    in: ["query"],
    isString: {
      errorMessage: "email must be in query and type must be a number to search!",
    },
  },
};

export const checkUserSchema = checkSchema(userSchema);
export const checkFilteredSchema = checkSchema(filteredSchema);

export const triggerBadRequest = (req, res, next) => {
  const errorList = validationResult(req);

  if (!errorList.isEmpty()) {
    next(createHttpError(400, "Error during post validation", { errors: errorList.array() }));
    // next(createHttpError(400, "Error during post validation"));
  } else {
    next();
  }
};
