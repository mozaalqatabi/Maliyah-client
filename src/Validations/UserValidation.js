import * as yup from "yup";

export const userSchemaValidation = yup.object().shape({
  name: yup
    .string()
    .required("Please enter your name")
    .test(
      "not-only-spaces",
      "Please enter your name", // reusing the same required message for consistency
      (value) => value && value.trim().length > 0
    )
    .test(
      "valid-name",
      "Name must contain only letters and spaces (no special characters)",
      (value) => {
        if (!value) return true;
        return /^[a-zA-Z\s]+$/.test(value);
      }
    ),

  email: yup
    .string()
    .required("Please enter your email")
    .test(
      "not-only-spaces",
      "Please enter your email",
      (value) => value && value.trim().length > 0
    )
    .email("Invalid email format"),

  password: yup
    .string()
    .required("Please enter your password")
    .test(
      "not-only-spaces",
      "Please enter your password",
      (value) => value && value.trim().length > 0
    )
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),

  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .test(
      "not-only-spaces",
      "Please confirm your password",
      (value) => value && value.trim().length > 0
    )
    .oneOf([yup.ref("password"), null], "Passwords do not match!"),
});
