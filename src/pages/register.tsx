// Next Imports
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Formik & Yup
import { useFormik } from "formik";
import * as Yup from "yup";

// Context
import { useUserAuth } from "../context/userAuthContext";
import { useCustomTranslation } from '../utils/useTranlsation';
import { useModal } from "@/context/modalContext";
// For putting user details on DB
import { useSession, signIn, getSession } from "next-auth/react";

function Register() {
  const router = useRouter();

  const { t } = useCustomTranslation();
  const { data: session } = useSession();
  //@ts-ignore
  const { showModal } = useModal();
  const [redirect, setRedirect] = useState("home");
  //@ts-ignore  
  const { user, register } = useUserAuth(); // get user from context

  useEffect(() => {
    async function get_token_value() {
      const _Session = await getSession();
      if (_Session?.user?.email) {
        let data = await register(
          _Session?.user?.email,
          "",
          "other",
          JSON.stringify(_Session)
        );
        if (data.success == true) {
          let url = localStorage.getItem("redirct");
          if (url && !url?.includes("login") && !url?.includes("register")) {
            setRedirect(url);
          }
        }
      }
    }
    get_token_value();
  }, [session, register]); // added 'register' to the dependencies array

  function processLogin() {
    router.push(redirect);
  }

  // Redirect user if already logged in
  useEffect(() => {
    if (user) {

      if (session) {
        let redirct_social = localStorage.getItem("redirct");
        if (redirct_social && !redirct_social?.includes("login") && !redirct_social?.includes("register")) {
          localStorage.setItem("redirct", "");
        }

        setTimeout(() => {
          processLogin();
        }, 500);
        console.log(redirct_social, redirect, user, session);
      }
      else {
        processLogin();
      }

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session]);


  // Formik
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(t("valid_email"))
        .required(t("required")),
      password: Yup.string()
        .required(t("no_password"))
        .min(8, t("min_password_length")),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), undefined], t("password_mismatch"))
        .required(t("required")),
    }),
    onSubmit: async () => {
      try {
        let data = await register(
          formik.values.email,
          formik.values.password,
          "web"
        );
        if (data.success == true) {
          let url = localStorage.getItem("redirct");
          if (url && !url?.includes("login") && !url?.includes("register")) {
            localStorage.setItem("redirct", "");
          }
          processLogin()
        }
        else {
          showModal(data?.message);
        }

      } catch (error) {
        console.log(error)
        showModal("something went wrong");
      }
    },
  });

  return (
    <>
      <form
        className="flex min-h-full h-screen w-screen flex-1 flex-col justify-center px-6 lg:px-8 bg-gray-100"
        onSubmit={formik.handleSubmit}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {t("register-account")}
          </h2>
        </div>
        {
          session &&

          <div className="fixed inset-0 flex items-center justify-center z-50 bg-white opacity-75">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
          </div>
        }
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="space-y-6 bg-white p-10 rounded-md shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {t("email_address")}
                </label>
                {formik.touched.email && formik.errors.email ? (
                  <p className="my-2 text-sm text-red-600 dark:text-red-500">
                    {formik.errors.email}
                  </p>
                ) : null}
              </div>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  className="custom-input-text"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {t("password")}
                </label>
                {formik.touched.password && formik.errors.password ? (
                  <p className="my-2 text-sm text-red-600 dark:text-red-500">
                    {formik.errors.password}
                  </p>
                ) : null}
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  className="custom-input-text"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {t("confirm_password")}
                </label>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword ? (
                  <p className="my-2 text-sm text-red-600 dark:text-red-500">
                    {formik.errors.confirmPassword}
                  </p>
                ) : null}
              </div>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  className="custom-input-text"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="custom-button"
              >
                {t("register")}
              </button>
            </div>
            <div className="pt-4">
              <div className="flex flex-row items-center text-center text-sm text-black font-normal">
                <hr className="flex-1" />
                <span className="flex-1 w-full py-1 px-4">
                  {t("or_continue_with")}
                </span>
                <hr className="flex-1" />
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    let _url = localStorage.getItem("redirct");
                    if (_url && _url?.length >= 5 && !_url?.includes("login") && !_url?.includes("register")) {
                      localStorage.setItem("redirct", _url);
                    }
                    signIn('google', { redirect: false })
                  }}
                  className="custom-button-2"
                >
                  <Image
                    width={50}
                    height={50}
                    className="w-4 h-4"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    loading="lazy"
                    alt="google logo"
                  />
                  <span>Google</span>
                </button>

                {/* Microsoft button */}
                <button
                  type="button"
                  onClick={() => {
                    let _url = localStorage.getItem("redirct");
                    if (_url && _url?.length >= 5 && !_url?.includes("login") && !_url?.includes("register")) {
                      localStorage.setItem("redirct", _url);
                    }
                    signIn('azure-ad', { redirect: false });
                  }}
                  className="custom-button-2"
                >
                  <Image
                    width={50}
                    height={50}
                    className="w-4 h-4"
                    src="https://learn.microsoft.com/en-us/azure/active-directory/develop/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.svg"
                    loading="lazy"
                    alt="microsoft logo"
                  />
                  <span>Microsoft</span>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            {t("already_have_account")}?{" "}
            <Link
              href="/login"
              className="font-semibold leading-6 text-blue-500 hover:text-blue-400"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}

export default Register;